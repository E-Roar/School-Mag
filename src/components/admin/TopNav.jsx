import { supabase } from "../../lib/supabaseClient";

export const TopNav = ({ currentView, onViewChange }) => {
    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'issues', label: 'Issues' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <nav className="bg-[#e0e5ec] px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] z-50">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] flex items-center justify-center text-blue-500 font-bold shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                        A
                    </div>
                    <span className="font-bold text-gray-700 text-lg tracking-tight">Admin Panel</span>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#e0e5ec] shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.8)]">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${currentView === item.id
                                    ? "text-blue-500 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.8)] transform scale-105"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleLogout}
                    className="neo-btn text-red-500 hover:text-red-600 text-xs px-4 py-2"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};
