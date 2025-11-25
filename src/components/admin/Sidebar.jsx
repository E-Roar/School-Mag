import { useBookData } from "../../context/BookDataContext";

export const Sidebar = () => {
    const { books, selectedBook, setActiveBookId, createNewBook, deleteBook, cleanupEmptyBooks } = useBookData();

    return (
        <aside className="w-80 bg-[#e0e5ec] flex flex-col border-r border-white/20 shadow-[9px_0_16px_rgba(163,177,198,0.4)] z-40">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-700 tracking-tight">Library</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Manage Issues</p>
            </div>

            <div className="px-4 pb-4">
                <button
                    onClick={() => {
                        if (confirm("Create a new issue?")) {
                            createNewBook();
                        }
                    }}
                    className="neo-btn w-full text-blue-600 flex items-center justify-center gap-2"
                >
                    <span>+</span> New Issue
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
                {books.map((book) => (
                    <div
                        key={book.id}
                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedBook?.id === book.id
                                ? "shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.8)] text-blue-600"
                                : "shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:transform hover:-translate-y-1"
                            }`}
                        onClick={() => setActiveBookId(book.id)}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                                <img
                                    src={book.pages?.[0]?.frontSrc || "/textures/DSC00933.jpg"}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-bold truncate ${selectedBook?.id === book.id ? "text-blue-600" : "text-gray-700"}`}>
                                    {book.title}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {book.is_published ? "🟢 Published" : "Draft"}
                                </p>
                            </div>
                        </div>

                        <button
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-[#e0e5ec] rounded-full shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,0.8)] transition-all"
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
                    className="w-full py-2 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                    Clean Empty Issues
                </button>
            </div>
        </aside>
    );
};
