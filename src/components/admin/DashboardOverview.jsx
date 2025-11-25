import { useEffect, useState } from "react";
import { useBookData } from "../../context/BookDataContext";
import { supabase } from "../../lib/supabaseClient";

export const DashboardOverview = () => {
    const { books } = useBookData();
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data, error } = await supabase
                    .from('activity_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (error) throw error;
                setLogs(data || []);
            } catch (err) {
                console.error("Error fetching logs:", err);
            } finally {
                setLoadingLogs(false);
            }
        };

        fetchLogs();
    }, []);

    const stats = [
        { label: "Total Issues", value: books.length, color: "text-blue-500" },
        { label: "Published", value: books.filter(b => b.is_published).length, color: "text-green-500" },
        { label: "Total Pages", value: books.reduce((acc, b) => acc + (b.pages?.length || 0), 0), color: "text-purple-500" },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#e0e5ec]">
            <h1 className="text-2xl font-bold text-gray-700 mb-6 tracking-tight">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="neo-card p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${stat.color} shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]`}>
                            {stat.value}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-700">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="neo-card p-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">Recent Activity</h2>
                {loadingLogs ? (
                    <div className="text-center py-8 text-gray-500">Loading activity...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No recent activity found.</div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl transition-colors hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-400 flex-shrink-0 shadow-[0_0_5px_rgba(66,153,225,0.6)]" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{log.action}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(log.created_at).toLocaleString()}
                                    </p>
                                    {log.details && (
                                        <pre className="text-xs text-gray-400 mt-2 p-2 rounded-lg bg-[#e0e5ec] shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] overflow-x-auto max-w-md">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
