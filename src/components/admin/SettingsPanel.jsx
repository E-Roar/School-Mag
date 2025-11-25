import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { logActivity } from "../../lib/logger";
import { validateLogoFile, generateLogoVariants } from "../../utils/logoCompression";

export const SettingsPanel = () => {
    const [settings, setSettings] = useState({
        school_name: "",
        school_description: "",
        school_logo_url: "",
        logo_size: 48 // Default size in pixels
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

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

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

        // Validate the file
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

            // Generate all logo variants
            const variants = await generateLogoVariants(file);

            setUploadProgress("Uploading files...");

            const timestamp = Date.now();
            const uploadedUrls = {};

            // Upload each variant
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

            // Update settings with all URLs
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

    const handleSaveSettings = async () => {
        setSaving(true);
        setMessage("");
        try {
            // Check if row exists
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto bg-[#e0e5ec]">
            <h1 className="text-2xl font-bold text-gray-700 mb-6 tracking-tight">Platform Settings</h1>

            {/* General Settings */}
            <div className="neo-card p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-700 mb-4">General Information</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">School / Organization Name</label>
                        <input
                            type="text"
                            value={settings.school_name}
                            onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                            className="neo-input"
                            placeholder="E.g. E-Roar Magazine"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">Description</label>
                        <textarea
                            value={settings.school_description}
                            onChange={(e) => setSettings({ ...settings, school_description: e.target.value })}
                            className="neo-input h-32 rounded-2xl"
                            placeholder="Brief description of the platform..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">Logo</label>
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
                                    <span>📤 {uploadProgress ? 'Uploading...' : 'Upload Logo'}</span>
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
                                        Upload PNG, JPG, or SVG. Best: 512x512px square. Will auto-generate favicons & OG images.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Logo Size Adjustment */}
                    {settings.school_logo_url && (
                        <div className="border-t border-gray-200/50 pt-6">
                            <label className="block text-sm font-semibold text-gray-600 mb-4 pl-2">Logo Size (for Navigation)</label>
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
                                        <span>Small (32px)</span>
                                        <span className="font-semibold text-blue-500">{settings.logo_size || 48}px</span>
                                        <span>Large (80px)</span>
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]">
                                    <span className="text-xs text-gray-500 font-medium">Preview:</span>
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
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="neo-card p-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">Security</h2>

                {/* Email Update */}
                <div className="mb-8 pb-8 border-b border-white/50">
                    <h3 className="text-md font-semibold text-gray-600 mb-4">Update Email</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end max-w-xl">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-500 mb-2 pl-2">Admin Email</label>
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
                            Update Email
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 pl-2">
                        Note: You will receive a confirmation email to both the old and new addresses.
                    </p>
                </div>

                {/* Password Update */}
                <div>
                    <h3 className="text-md font-semibold text-gray-600 mb-4">Change Password</h3>
                    <div className="space-y-6 max-w-xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2 pl-2">New Password</label>
                            <input
                                type="password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                className="neo-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2 pl-2">Confirm Password</label>
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
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
