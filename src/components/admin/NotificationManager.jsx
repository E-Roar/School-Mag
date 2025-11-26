import { useState } from 'react';
import { createNotification } from '../../lib/supabaseQueries';

export const NotificationManager = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        target_url: ''
    });
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setStatus('');

        try {
            await createNotification(formData);
            setStatus('success');
            setFormData({ title: '', message: '', type: 'info', target_url: '' });
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            console.error('Error sending notification:', error);
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    return (
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
    );
};
