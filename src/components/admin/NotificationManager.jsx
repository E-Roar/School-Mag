import { useState, useEffect } from 'react';
import { createNotification, fetchNotifications, deleteNotification } from '../../lib/supabaseQueries';

export const NotificationManager = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        target_url: ''
    });
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState('');
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await fetchNotifications(20); // Fetch last 20
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setStatus('');

        try {
            await createNotification(formData);
            setStatus('success');
            setFormData({ title: '', message: '', type: 'info', target_url: '' });
            loadHistory(); // Refresh history
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            console.error('Error sending notification:', error);
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;

        try {
            await deleteNotification(id);
            setHistory(history.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Failed to delete notification');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Notification Form */}
            <div className="neo-card p-6">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Push Notifications</h3>
                    <p className="text-sm text-gray-500">
                        Send instant notifications to all users with the app installed on their devices.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">
                            Notification Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="neo-input"
                            required
                        >
                            <option value="info">Info</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="new_issue">New Issue</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="neo-input"
                            placeholder="e.g., New Issue Released!"
                            maxLength={60}
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1 pl-2">
                            {formData.title.length}/60 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="neo-input h-24 rounded-2xl"
                            placeholder="Your notification message..."
                            maxLength={200}
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1 pl-2">
                            {formData.message.length}/200 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2 pl-2">
                            Link (Optional)
                        </label>
                        <input
                            type="url"
                            value={formData.target_url}
                            onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                            className="neo-input"
                            placeholder="/view/issue-id"
                        />
                        <p className="text-xs text-gray-400 mt-1 pl-2">
                            Users will be redirected here when clicking the notification
                        </p>
                    </div>

                    {status && (
                        <div className={`p-3 rounded-lg text-sm font-medium ${status === 'success'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                            }`}>
                            {status === 'success'
                                ? '✓ Notification sent successfully!'
                                : '✗ Failed to send notification. Please try again.'}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={sending}
                        className={`w-full neo-btn text-blue-600 py-3 font-bold hover:scale-105 transition-transform ${sending ? 'opacity-50 cursor-wait' : ''
                            }`}
                    >
                        {sending ? 'Sending...' : '📢 Send Notification to All Users'}
                    </button>
                </form>
            </div>

            {/* Notification History */}
            <div className="neo-card p-6 flex flex-col h-full">
                <div className="mb-6 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-700">Recent History</h3>
                    <button
                        onClick={loadHistory}
                        className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                    >
                        Refresh
                    </button>
                </div>

                {loadingHistory ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Loading history...
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        No notifications sent yet.
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 glass-scroll">
                        {history.map((item) => (
                            <div key={item.id} className="p-4 rounded-xl bg-white/50 border border-white/60 shadow-sm relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${item.type === 'success' ? 'bg-green-100 text-green-600' :
                                            item.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                                item.type === 'new_issue' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-blue-100 text-blue-600'
                                        }`}>
                                        {item.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-700 mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{item.message}</p>
                                {item.target_url && (
                                    <div className="text-xs text-blue-500 truncate mb-2">
                                        🔗 {item.target_url}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete from history"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
