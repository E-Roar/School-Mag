import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { logActivity } from "../../lib/logger";

export const SettingsPanel = () => {
    const [settings, setSettings] = useState({
        school_name: "",
        school_description: "",
        school_logo_url: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

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
                .single();

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

        setSaving(true);
        setMessage("Uploading logo...");

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `school-logo-${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            // Upload to 'pages' bucket (assuming it's available and has public read)
            // Ideally we'd have a separate 'assets' bucket, but 'pages' is already configured.
            const { error: uploadError } = await supabase.storage
                .from('pages')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('pages')
                .getPublicUrl(filePath);

            setSettings(prev => ({ ...prev, school_logo_url: publicUrl }));
            setMessage("Logo uploaded! Don't forget to save changes.");
        } catch (error) {
            console.error("Error uploading logo:", error);
            setMessage("Error uploading logo: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        setMessage("");
        try {
            // Check if row exists
            const { data: existing } = await supabase.from('settings').select('id').single();

            let error;
            if (existing) {
                const { error: updateError } = await supabase
                    .from('settings')
                    .update({
                        school_name: settings.school_name,
                        school_description: settings.school_description,
                        school_logo_url: settings.school_logo_url,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('settings')
                    .insert([{
                        school_name: settings.school_name,
                        school_description: settings.school_description,
                        school_logo_url: settings.school_logo_url
                    }]);
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
                                <div className="w-16 h-16 rounded-xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] p-2 flex items-center justify-center">
                                    <img
                                        src={settings.school_logo_url}
                                        alt="School Logo"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="neo-btn cursor-pointer inline-flex items-center gap-2 text-sm text-gray-600 px-4 py-2">
                                    <span>📤 Upload Logo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoUpload}
                                    />
                                </label>
                                <p className="text-xs text-gray-400 mt-2 pl-2">
                                    Upload a PNG or JPG file. Recommended size: 200x200px.
                                </p>
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
