import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { logActivity } from "../../lib/logger";
import { validateLogoFile, generateLogoVariants } from "../../utils/logoCompression";
import { compressImage } from "../../utils/imageCompression";
import { NotificationManager } from "./NotificationManager";
import { useTranslation } from 'react-i18next';

export const SettingsPanel = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({
        school_name: "",
        school_description: "",
        school_logo_url: "",
        logo_size: 48, // Default size in pixels
        enable_space_theme: false, // Deprecated but kept for schema compatibility
        landing_bg_url: "",
        landing_bg_fixed: true,
        landing_bg_size: "cover",
        landing_bg_repeat: "no-repeat"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadProgress, setUploadProgress] = useState(null);

    // Password Change State
    const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
    const [passMessage, setPassMessage] = useState("");

    // Email Change State
    const [email, setEmail] = useState("");

    // Accordion State
    const [openSections, setOpenSections] = useState({
        general: false,
        appearance: false,
        security: false,
        notifications: false
    });

    useEffect(() => {
        fetchSettings();
        fetchUserEmail();
    }, []);

    const fetchUserEmail = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setEmail(user.email);
    };

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setSettings(data);
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateLogoFile(file);
        if (!validation.valid) {
            setMessage(`Error: ${validation.error}`);
            return;
        }

        setSaving(true);
        setUploadProgress("Validating...");
        setMessage("");

        try {
            setUploadProgress("Compressing and generating variants...");
            const variants = await generateLogoVariants(file);

            setUploadProgress("Uploading files...");
            const timestamp = Date.now();
            const uploadedUrls = {};

            const uploads = [
                { key: 'full', file: variants.full, path: `logos/logo-${timestamp}.webp` },
                { key: 'favicon192', file: variants.favicon192, path: `logos/favicon-192-${timestamp}.png` },
                { key: 'favicon512', file: variants.favicon512, path: `logos/favicon-512-${timestamp}.png` },
                { key: 'thumbnail', file: variants.thumbnail, path: `logos/thumbnail-${timestamp}.webp` },
                { key: 'ogImage', file: variants.ogImage, path: `logos/og-image-${timestamp}.jpg` }
            ];

            for (const upload of uploads) {
                const { error: uploadError } = await supabase.storage
                    .from('pages')
                    .upload(upload.path, upload.file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('pages')
                    .getPublicUrl(upload.path);

                uploadedUrls[upload.key] = publicUrl;
            }

            setUploadProgress("Updating settings...");

            setSettings(prev => ({
                ...prev,
                school_logo_url: uploadedUrls.full,
                school_logo_favicon_192: uploadedUrls.favicon192,
                school_logo_favicon_512: uploadedUrls.favicon512,
                school_logo_thumbnail: uploadedUrls.thumbnail,
                school_logo_og: uploadedUrls.ogImage
            }));

            setUploadProgress(null);
            setMessage("✓ Logo uploaded successfully! Don't forget to save changes.");
            logActivity("Uploaded School Logo", { variants: Object.keys(uploadedUrls) });
        } catch (error) {
            console.error("Error uploading logo:", error);
            setMessage("Error uploading logo: " + error.message);
            setUploadProgress(null);
        } finally {
            setSaving(false);
        }
    };

    const handleBackgroundUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        setUploadProgress("Compressing background...");
        setMessage("");

        try {
            // Compress and convert to WebP
            const compressedFile = await compressImage(file, 1920, 0.8);

            setUploadProgress("Uploading background...");
            const timestamp = Date.now();
            const path = `backgrounds/landing-bg-${timestamp}.webp`;

            const { error: uploadError } = await supabase.storage
                .from('pages') // Reuse pages bucket or assets
                .upload(path, compressedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('pages')
                .getPublicUrl(path);

            setSettings(prev => ({
                ...prev,
                landing_bg_url: publicUrl
            }));

            setUploadProgress(null);
            setMessage("✓ Background uploaded! Don't forget to save.");
            logActivity("Uploaded Landing Background");
        } catch (error) {
            console.error("Error uploading background:", error);
            setMessage("Error uploading background: " + error.message);
            setUploadProgress(null);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        setMessage("");
        try {
            const { data: existing } = await supabase.from('settings').select('id').maybeSingle();

            const settingsData = {
                school_name: settings.school_name,
                school_description: settings.school_description,
                school_logo_url: settings.school_logo_url,
                school_logo_favicon_192: settings.school_logo_favicon_192,
                school_logo_favicon_512: settings.school_logo_favicon_512,
                school_logo_thumbnail: settings.school_logo_thumbnail,
                school_logo_og: settings.school_logo_og,
                logo_size: settings.logo_size || 48,
                enable_space_theme: false, // Force disable space theme
                landing_bg_url: settings.landing_bg_url,
                landing_bg_fixed: settings.landing_bg_fixed,
                landing_bg_size: settings.landing_bg_size,
                landing_bg_repeat: settings.landing_bg_repeat,
                updated_at: new Date().toISOString()
            };

            let error;
            if (existing) {
                const { error: updateError } = await supabase
                    .from('settings')
                    .update(settingsData)
                    .eq('id', existing.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('settings')
                    .insert([settingsData]);
                error = insertError;
            }

            if (error) throw error;

            setMessage("Settings saved successfully!");
            logActivity("Updated School Settings", { settings });
        } catch (err) {
            console.error("Error saving settings:", err);
            setMessage("Error saving settings: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEmailChange = async () => {
        setSaving(true);
        setMessage("");
        try {
            const { error } = await supabase.auth.updateUser({ email: email });
            if (error) throw error;
            alert("Confirmation links have been sent to both your old and new email addresses.");
            logActivity("Requested Email Update", { new_email: email });
        } catch (err) {
            console.error("Error updating email:", err);
            alert("Error updating email: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            setPassMessage("Passwords do not match.");
            return;
        }
        if (passwords.newPassword.length < 6) {
            setPassMessage("Password must be at least 6 characters.");
            return;
        }

        setSaving(true);
        setPassMessage("");
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.newPassword
            });

            if (error) throw error;

            setPassMessage("Password updated successfully!");
            setPasswords({ newPassword: "", confirmPassword: "" });
            logActivity("Updated Admin Password");
        } catch (err) {
            console.error("Error updating password:", err);
            setPassMessage("Error: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t('admin.settings_panel.loading_settings')}</div>;

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">{t('admin.settings_panel.school_name')}</label>
                <input
                    type="text"
                    value={settings.school_name}
                    onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                    className="neo-input"
                    placeholder={t('admin.settings_panel.school_name_placeholder')}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">{t('admin.settings_panel.description')}</label>
                <textarea
                    value={settings.school_description}
                    onChange={(e) => setSettings({ ...settings, school_description: e.target.value })}
                    className="neo-input h-32 rounded-2xl"
                    placeholder={t('admin.settings_panel.description_placeholder')}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">{t('admin.settings_panel.logo')}</label>
                <div className="flex items-center gap-4">
                    {settings.school_logo_url && (
                        <div className="w-20 h-20 rounded-xl bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] p-3 flex items-center justify-center hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] transition-all duration-300">
                            <img
                                src={settings.school_logo_url}
                                alt="School Logo"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <label className="neo-btn cursor-pointer inline-flex items-center gap-2 text-sm text-gray-600 px-4 py-2 hover:scale-105 transition-transform">
                            <span>📤 {uploadProgress ? t('admin.settings_panel.uploading') : t('admin.settings_panel.upload_logo')}</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoUpload}
                                disabled={saving}
                            />
                        </label>
                        {uploadProgress && (
                            <p className="text-xs text-blue-500 mt-2 pl-2 font-medium animate-pulse">
                                {uploadProgress}
                            </p>
                        )}
                        {!uploadProgress && (
                            <p className="text-xs text-gray-400 mt-2 pl-2">
                                {t('admin.settings_panel.upload_hint')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {settings.school_logo_url && (
                <div className="border-t border-gray-200/50 pt-6">
                    <label className="block text-sm font-semibold text-gray-600 mb-4 pl-2">{t('admin.settings_panel.logo_size_nav')}</label>
                    <div className="flex items-center gap-6">
                        <div className="flex-1 space-y-4">
                            <input
                                type="range"
                                min="32"
                                max="80"
                                value={settings.logo_size || 48}
                                onChange={(e) => setSettings({ ...settings, logo_size: parseInt(e.target.value) })}
                                className="w-full h-2 bg-[#e0e5ec] rounded-full appearance-none cursor-pointer shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] outline-none"
                                style={{
                                    background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((settings.logo_size || 48) - 32) / 48 * 100}%, #e0e5ec ${((settings.logo_size || 48) - 32) / 48 * 100}%, #e0e5ec 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-gray-400 px-2">
                                <span>{t('admin.settings_panel.small')} (32px)</span>
                                <span className="font-semibold text-blue-500">{settings.logo_size || 48}px</span>
                                <span>{t('admin.settings_panel.large')} (80px)</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]">
                            <span className="text-xs text-gray-500 font-medium">{t('admin.settings_panel.preview')}:</span>
                            <div
                                className="rounded-xl bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.8)] p-2 flex items-center justify-center transition-all duration-200"
                                style={{
                                    width: `${settings.logo_size || 48}px`,
                                    height: `${settings.logo_size || 48}px`
                                }}
                            >
                                <img
                                    src={settings.school_logo_url}
                                    alt="Logo Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-4">
                <p className={`text-sm font-medium ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>{message}</p>
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="neo-btn text-blue-600 px-8"
                >
                    {saving ? t('admin.settings_panel.saving') : t('common.save')}
                </button>
            </div>
        </div>
    );

    const renderAppearanceSettings = () => (
        <div className="space-y-6">
            <div className="space-y-8">
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-md font-semibold text-gray-600 mb-2">🖼️ {t('admin.settings_panel.landing_bg')}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {t('admin.settings_panel.landing_bg_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Background Upload */}
                    <div className="p-6 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] space-y-6">

                        {/* Image Preview & Upload */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-full md:w-1/3 aspect-video rounded-xl bg-gray-200 overflow-hidden shadow-inner flex items-center justify-center relative group">
                                {settings.landing_bg_url ? (
                                    <>
                                        <img
                                            src={settings.landing_bg_url}
                                            alt="Background"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => setSettings(s => ({ ...s, landing_bg_url: "" }))}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove Image"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-gray-400 text-sm">{t('admin.settings_panel.no_image_set')}</span>
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="neo-btn cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 px-6 py-3 hover:scale-105 transition-transform">
                                        <span>📤 {uploadProgress && uploadProgress.includes('background') ? t('admin.settings_panel.processing') : t('admin.settings_panel.upload_bg')}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleBackgroundUpload}
                                            disabled={saving}
                                        />
                                    </label>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {t('admin.settings_panel.bg_recommended')}
                                    </p>
                                </div>

                                {/* Settings Controls */}
                                {settings.landing_bg_url && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-300/50">
                                        {/* Fixed vs Scroll */}
                                        <div className="flex items-center justify-between bg-white/50 p-3 rounded-lg">
                                            <span className="text-sm text-gray-600 font-medium">{t('admin.settings_panel.attachment')}</span>
                                            <button
                                                onClick={() => setSettings(s => ({ ...s, landing_bg_fixed: !s.landing_bg_fixed }))}
                                                className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                            >
                                                {settings.landing_bg_fixed ? t('admin.settings_panel.fixed_parallax') : t('admin.settings_panel.scrollable')}
                                            </button>
                                        </div>

                                        {/* Size Mode */}
                                        <div className="flex items-center justify-between bg-white/50 p-3 rounded-lg">
                                            <span className="text-sm text-gray-600 font-medium">{t('admin.settings_panel.size')}</span>
                                            <select
                                                value={settings.landing_bg_size}
                                                onChange={(e) => setSettings(s => ({ ...s, landing_bg_size: e.target.value }))}
                                                className="text-xs font-bold text-blue-600 bg-transparent border-none focus:ring-0 cursor-pointer text-right"
                                            >
                                                <option value="cover">{t('admin.settings_panel.cover_fill')}</option>
                                                <option value="contain">{t('admin.settings_panel.contain_fit')}</option>
                                                <option value="auto">{t('admin.settings_panel.auto_original')}</option>
                                            </select>
                                        </div>

                                        {/* Repeat Mode */}
                                        <div className="flex items-center justify-between bg-white/50 p-3 rounded-lg">
                                            <span className="text-sm text-gray-600 font-medium">{t('admin.settings_panel.repeat')}</span>
                                            <select
                                                value={settings.landing_bg_repeat}
                                                onChange={(e) => setSettings(s => ({ ...s, landing_bg_repeat: e.target.value }))}
                                                className="text-xs font-bold text-blue-600 bg-transparent border-none focus:ring-0 cursor-pointer text-right"
                                            >
                                                <option value="no-repeat">{t('admin.settings_panel.no_repeat')}</option>
                                                <option value="repeat">{t('admin.settings_panel.repeat_tile')}</option>
                                                <option value="repeat-x">{t('admin.settings_panel.repeat_x')}</option>
                                                <option value="repeat-y">{t('admin.settings_panel.repeat_y')}</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <p className={`text-sm font-medium ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>{message}</p>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="neo-btn text-blue-600 px-8"
                    >
                        {saving ? t('admin.settings_panel.saving') : t('common.save')}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-8">
            <div className="pb-8 border-b border-white/50">
                <h3 className="text-md font-semibold text-gray-600 mb-4">{t('admin.settings_panel.update_email')}</h3>
                <div className="flex flex-col md:flex-row gap-4 items-end max-w-xl">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-500 mb-2 pl-2">{t('admin.settings_panel.admin_email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="neo-input"
                        />
                    </div>
                    <button
                        onClick={handleEmailChange}
                        disabled={saving}
                        className="neo-btn text-blue-500 whitespace-nowrap"
                    >
                        {t('admin.settings_panel.update_email_btn')}
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-3 pl-2">
                    {t('admin.settings_panel.email_note')}
                </p>
            </div>

            <div>
                <h3 className="text-md font-semibold text-gray-600 mb-4">{t('admin.settings_panel.change_password')}</h3>
                <div className="space-y-6 max-w-xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2 pl-2">{t('admin.settings_panel.new_password')}</label>
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            className="neo-input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2 pl-2">{t('admin.settings_panel.confirm_password')}</label>
                        <input
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            className="neo-input"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <p className={`text-sm font-medium ${passMessage.includes("Error") ? "text-red-500" : "text-green-500"}`}>{passMessage}</p>
                        <button
                            onClick={handlePasswordChange}
                            disabled={saving}
                            className="neo-btn text-red-500 px-6"
                        >
                            {t('admin.settings_panel.update_password')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const accordionSections = [
        {
            id: "general",
            label: t('admin.settings_panel.general_info'),
            icon: "⚙️",
            description: t('admin.settings_panel.general_desc'),
            component: renderGeneralSettings()
        },
        {
            id: "appearance",
            label: t('admin.settings_panel.appearance'),
            icon: "🎨",
            description: t('admin.settings_panel.appearance_desc'),
            component: renderAppearanceSettings()
        },
        {
            id: "security",
            label: t('admin.settings_panel.security'),
            icon: "🔒",
            description: t('admin.settings_panel.security_desc'),
            component: renderSecuritySettings()
        },
        {
            id: "notifications",
            label: t('admin.settings_panel.notifications'),
            icon: "🔔",
            description: t('admin.settings_panel.notifications_desc'),
            component: <NotificationManager />
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto bg-[#e0e5ec]">
            <h1 className="text-2xl font-bold text-gray-700 mb-6 tracking-tight">{t('admin.settings_panel.platform_settings')}</h1>

            <div className="space-y-6 pb-20">
                {accordionSections.map((section) => (
                    <div
                        key={section.id}
                        className="neo-card overflow-hidden transition-all duration-300"
                    >
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full p-6 flex items-center justify-between hover:bg-white/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-3xl filter drop-shadow-md">{section.icon}</span>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-gray-700">{section.label}</h3>
                                    <p className="text-sm text-gray-500">{section.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-medium ${openSections[section.id] ? 'text-blue-500' : 'text-gray-400'}`}>
                                    {openSections[section.id] ? t('admin.settings_panel.collapse') : t('admin.settings_panel.expand')}
                                </span>
                                <svg
                                    className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${openSections[section.id] ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out ${openSections[section.id]
                                ? 'max-h-[5000px] opacity-100'
                                : 'max-h-0 opacity-0 overflow-hidden'
                                }`}
                        >
                            <div className="p-6 pt-0 border-t border-gray-200/50">
                                {section.component}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
