import { useState, useEffect } from "react";
import { useBookData } from "../../context/BookDataContext";

export const IssueDetails = ({ book }) => {
    const { updateBookMeta } = useBookData();
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        issueTag: "",
        releaseDate: "",
        is_published: false,
        listOfContent: ""
    });
    const [isDirty, setIsDirty] = useState(false);

    // Sync local state when book changes
    useEffect(() => {
        if (book) {
            setFormData({
                title: book.title ?? "",
                subtitle: book.subtitle ?? "",
                issueTag: book.issueTag ?? "",
                releaseDate: book.releaseDate ?? "",
                is_published: book.is_published ?? false,
                listOfContent: book.listOfContent ?? ""
            });
            setIsDirty(false);
        }
    }, [book]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = () => {
        updateBookMeta(book.id, formData);
        setIsDirty(false);
    };

    return (
        <div className="space-y-6">
            {/* Metadata Card */}
            <div className="neo-card p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-sm">📋</span>
                        <div>
                            <h3 className="text-lg font-bold text-gray-700">Basic Information</h3>
                            <p className="text-sm text-gray-500">Core metadata for this issue</p>
                        </div>
                    </div>
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            className="neo-btn bg-blue-500 text-white px-6 py-2 hover:bg-blue-600 transition-colors animate-pulse"
                        >
                            💾 Save Changes
                        </button>
                    )}
                </div>

                <div className="grid gap-6">
                    {/* Title & Subtitle */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 pl-2">
                                <span className="text-blue-500">📖</span>
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="neo-input"
                                placeholder="e.g. Winter Issue"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 pl-2">
                                <span className="text-purple-500">✨</span>
                                Subtitle
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => handleChange("subtitle", e.target.value)}
                                className="neo-input"
                                placeholder="e.g. A collection of stories"
                            />
                        </div>
                    </div>

                    {/* Issue Tag, Date & Status */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 pl-2">
                                <span className="text-green-500">🏷️</span>
                                Issue Tag
                            </label>
                            <input
                                type="text"
                                value={formData.issueTag}
                                onChange={(e) => handleChange("issueTag", e.target.value)}
                                className="neo-input"
                                placeholder="e.g. Vol. 12"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 pl-2">
                                <span className="text-orange-500">📅</span>
                                Release Date
                            </label>
                            <input
                                type="date"
                                value={formData.releaseDate?.slice(0, 10) ?? ""}
                                onChange={(e) => handleChange("releaseDate", e.target.value)}
                                className="neo-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 pl-2">
                                <span className={formData.is_published ? "text-green-500" : "text-gray-400"}>
                                    {formData.is_published ? "✅" : "📝"}
                                </span>
                                Publication Status
                            </label>
                            <select
                                value={formData.is_published ? "published" : "draft"}
                                onChange={(e) => handleChange("is_published", e.target.value === "published")}
                                className="neo-input appearance-none"
                            >
                                <option value="draft">📝 Draft (Hidden)</option>
                                <option value="published">✅ Published (Visible)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Searchable Content Card */}
            <div className="neo-card p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-sm">🔍</span>
                        <div>
                            <h3 className="text-lg font-bold text-gray-700">Searchable Content</h3>
                            <p className="text-sm text-gray-500">Keywords and content for search functionality</p>
                        </div>
                    </div>
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            className="neo-btn bg-blue-500 text-white px-6 py-2 hover:bg-blue-600 transition-colors animate-pulse"
                        >
                            💾 Save Changes
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 pl-2">
                        <span className="text-blue-500">📝</span>
                        List of Content
                        <span className="text-xs text-gray-400 font-normal ml-auto">
                            (Used for search only - not publicly displayed)
                        </span>
                    </label>
                    <textarea
                        value={formData.listOfContent}
                        onChange={(e) => handleChange("listOfContent", e.target.value)}
                        rows={8}
                        className="neo-input resize-y min-h-[120px] leading-relaxed rounded-2xl"
                        placeholder="Enter keywords, article titles, author names, or summary...

Examples:
• Student Council Election 2024
• Art Exhibition: Sarah Johnson
• Science Fair Winners
• Principal's Message
• Sports Day Highlights"
                        style={{
                            lineHeight: '1.6',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                        }}
                    />
                    <div className="flex items-start gap-2 p-4 bg-[#e0e5ec] rounded-xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                        <span className="text-blue-500 text-sm">💡</span>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            <strong>Tip:</strong> Add article titles, author names, keywords, and topics.
                            Use bullet points or separate lines for better readability.
                            This content helps users find this issue through search but won't be displayed publicly.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions Card */}
            <div className="neo-card p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-gray-700 mb-1">Quick Actions</h4>
                        <p className="text-sm text-gray-500">Common tasks for this issue</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => {
                                const confirmed = confirm("Are you sure you want to duplicate this issue? This will create a copy with all pages.");
                                if (confirmed) {
                                    alert("Duplication feature coming soon!");
                                }
                            }}
                            className="neo-btn text-gray-600 text-sm flex items-center gap-2"
                        >
                            <span>📋</span>
                            Duplicate Issue
                        </button>
                        <button
                            onClick={() => {
                                const url = `/view/${book.id}`;
                                navigator.clipboard.writeText(window.location.origin + url);
                                alert("Share link copied to clipboard!");
                            }}
                            className="neo-btn text-gray-600 text-sm flex items-center gap-2"
                        >
                            <span>🔗</span>
                            Copy Share Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
