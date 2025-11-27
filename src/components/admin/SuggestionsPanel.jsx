import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export const SuggestionsPanel = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, latest, oldest

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('suggestions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSuggestions(data || []);
        } catch (err) {
            console.error("Error fetching suggestions:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteSuggestion = async (id) => {
        if (!confirm("Delete this suggestion?")) return;

        try {
            const { error } = await supabase
                .from('suggestions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSuggestions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error("Error deleting suggestion:", err);
            alert("Failed to delete suggestion");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredSuggestions = [...suggestions].sort((a, b) => {
        if (filter === "oldest") {
            return new Date(a.created_at) - new Date(b.created_at);
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-700 tracking-tight">💬 User Suggestions</h1>
                        <p className="text-gray-500 mt-2">
                            Anonymous feedback from your readers
                        </p>
                    </div>
                    <button
                        onClick={fetchSuggestions}
                        className="neo-btn text-blue-600 px-6 py-3 hover:scale-105 transition-transform"
                    >
                        🔄 Refresh
                    </button>
                </div>

                {/* Filter & Stats */}
                <div className="neo-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider">Total</p>
                            <p className="text-2xl font-bold text-gray-700">{suggestions.length}</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider">Latest</p>
                            <p className="text-sm text-gray-600">
                                {suggestions.length > 0 ? formatDate(suggestions[0].created_at) : "No suggestions"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilter("latest")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "latest"
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Latest First
                        </button>
                        <button
                            onClick={() => setFilter("oldest")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "oldest"
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Oldest First
                        </button>
                    </div>
                </div>

                {/* Suggestions List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredSuggestions.length === 0 ? (
                    <div className="neo-card p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Suggestions Yet</h3>
                        <p className="text-gray-500">When users submit feedback, it will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSuggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="neo-card p-6 group hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] transition-all duration-300"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                            {suggestion.content}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-3 uppercase tracking-wider">
                                            📅 {formatDate(suggestion.created_at)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteSuggestion(suggestion.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-[#e0e5ec] rounded-full shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,0.8)] transition-all flex-shrink-0"
                                        title="Delete suggestion"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
