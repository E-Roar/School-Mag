import { useBookData } from "../../context/BookDataContext";

export const IssueDetails = ({ book }) => {
    const { updateBookMeta } = useBookData();

    const handleChange = (field, value) => {
        updateBookMeta(book.id, { [field]: value });
    };

    return (
        <div className="glass-card p-8 space-y-8">
            <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-gray-800">Issue Metadata</h3>
                <p className="text-sm text-gray-500">Basic information about this issue</p>
            </div>

            <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={book.title ?? ""}
                            onChange={(e) => handleChange("title", e.target.value)}
                            className="glass-input"
                            placeholder="e.g. Winter Issue"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Subtitle</label>
                        <input
                            type="text"
                            value={book.subtitle ?? ""}
                            onChange={(e) => handleChange("subtitle", e.target.value)}
                            className="glass-input"
                            placeholder="e.g. A collection of stories"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Issue Tag</label>
                        <input
                            type="text"
                            value={book.issueTag ?? ""}
                            onChange={(e) => handleChange("issueTag", e.target.value)}
                            className="glass-input"
                            placeholder="e.g. Vol. 12"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Release Date</label>
                        <input
                            type="date"
                            value={book.releaseDate?.slice(0, 10) ?? ""}
                            onChange={(e) => handleChange("releaseDate", e.target.value)}
                            className="glass-input"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={book.is_published ? "published" : "draft"}
                            onChange={(e) => handleChange("is_published", e.target.value === "published")}
                            className="glass-input"
                        >
                            <option value="draft">Draft (Hidden)</option>
                            <option value="published">Published (Visible)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">List of Content (Searchable)</label>
                    <textarea
                        value={book.listOfContent ?? ""}
                        onChange={(e) => handleChange("listOfContent", e.target.value)}
                        rows={6}
                        className="glass-input resize-none"
                        placeholder="Enter keywords, article titles, or summary..."
                    />
                    <p className="text-xs text-gray-500">This content is used for search but not displayed directly.</p>
                </div>
            </div>
        </div>
    );
};
