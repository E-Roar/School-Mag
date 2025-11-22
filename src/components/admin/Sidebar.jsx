import { useBookData } from "../../context/BookDataContext";

export const Sidebar = () => {
    const { books, selectedBook, setActiveBookId, createNewBook, deleteBook, cleanupEmptyBooks } = useBookData();

    return (
        <aside className="glass-sidebar flex flex-col">
            <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-bold text-gradient">Admin Panel</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Dashboard</p>
            </div>

            <div className="p-4">
                <button
                    onClick={() => {
                        if (confirm("Create a new issue?")) {
                            createNewBook();
                        }
                    }}
                    className="w-full glass-btn-primary py-2 text-sm flex items-center justify-center gap-2"
                >
                    <span>+</span> New Issue
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-1">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Issues ({books.length})
                </p>

                {books.map((book) => (
                    <div
                        key={book.id}
                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedBook?.id === book.id
                                ? "bg-white/40 shadow-sm border border-white/40"
                                : "hover:bg-white/20 border border-transparent"
                            }`}
                        onClick={() => setActiveBookId(book.id)}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                <img
                                    src={book.pages?.[0]?.frontSrc || "/textures/DSC00933.jpg"}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-medium truncate ${selectedBook?.id === book.id ? "text-gray-900" : "text-gray-700"}`}>
                                    {book.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {book.is_published ? "🟢 Published" : "Draft"}
                                </p>
                            </div>
                        </div>

                        <button
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete "${book.title}"?`)) {
                                    deleteBook(book.id);
                                }
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/20 space-y-4">
                <button
                    onClick={() => {
                        if (confirm("Are you sure you want to delete all empty/test issues? This cannot be undone.")) {
                            cleanupEmptyBooks();
                        }
                    }}
                    className="w-full py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                >
                    Clean Empty Issues
                </button>
                <div className="text-xs text-center text-gray-400">
                    v2.0.0 • E-Roar
                </div>
            </div>
        </aside>
    );
};
