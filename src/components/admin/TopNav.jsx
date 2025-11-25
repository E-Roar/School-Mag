import { supabase } from "../../lib/supabaseClient";
import { NeomorphicLogo } from "../NeomorphicLogo";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MobileMenu, MobileMenuItem } from "../MobileMenu";

export const TopNav = ({ currentView, onViewChange }) => {
    const [settings, setSettings] = useState({
        school_logo_url: "",
        school_name: "",
        logo_size: 48
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Only fetch basic fields to avoid database errors
                const { data } = await supabase
                    .from('settings')
                    .select('school_logo_url, school_name')
                    .single();
                if (data) {
                    // Set default logo_size if not in database yet
                    setSettings({
                        ...data,
                        logo_size: data.logo_size || 48
                    });
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'issues', label: 'Issues', icon: '📚' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <nav className="bg-[#e0e5ec] px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] relative">
            <div className="flex items-center gap-4 md:gap-8 flex-1">
                <Link to="/" className="flex items-center gap-2 md:gap-3 group">
                    <NeomorphicLogo
                        logoUrl={settings.school_logo_url}
                        alt={settings.school_name || "Logo"}
                        customSize={settings.logo_size || 48}
                    />
                    <span className="font-bold text-gray-700 text-sm md:text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                        Admin Panel
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2 p-1.5 rounded-full bg-[#e0e5ec] shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.8)]">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${currentView === item.id
                                    ? "text-blue-500 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.8)] transform scale-105"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
                <Link
                    to="/"
                    className="neo-btn text-blue-500 hover:text-blue-600 text-xs px-4 py-2 hover:scale-105 transition-transform"
                >
                    🏠 Back Home
                </Link>
                <button
                    onClick={handleLogout}
                    className="neo-btn text-red-500 hover:text-red-600 text-xs px-4 py-2"
                >
                    Logout
                </button>
            </div>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {navItems.map((item) => (
                    <MobileMenuItem
                        key={item.id}
                        onClick={() => { onViewChange(item.id); setMobileMenuOpen(false); }}
                        className={currentView === item.id ? "bg-blue-50 text-blue-600" : ""}
                    >
                        {item.icon} {item.label}
                    </MobileMenuItem>
                ))}
                <div className="pt-2 border-t border-gray-200/50 space-y-2">
                    <Link
                        to="/"
                        className="neo-btn text-blue-500 text-xs px-4 py-2 w-full flex items-center justify-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        🏠 Back Home
                    </Link>
                    <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="neo-btn text-red-500 text-xs px-4 py-2 w-full"
                    >
                        🚪 Logout
                    </button>
                </div>
            </MobileMenu>
        </nav>
    );
};
