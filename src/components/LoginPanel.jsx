import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const LoginPanel = ({ onAuthenticated, error, loading }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        onAuthenticated(email, password);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md p-8 space-y-6">
                <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-2">
                        Admin Access
                    </p>
                    <h2 className="text-3xl font-bold text-gradient">Sign in</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass-input"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full glass-btn-primary py-3 font-semibold uppercase tracking-wider"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <div className="text-center space-y-4">
                    <p className="text-xs text-gray-500">
                        Only administrators with existing credentials may sign in.
                    </p>

                    {error && (
                        <button
                            type="button"
                            onClick={async () => {
                                if (supabase) await supabase.auth.signOut();
                                window.location.reload();
                            }}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                            Force Logout / Clear Session
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
