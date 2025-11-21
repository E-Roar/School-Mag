import { useState } from "react";
import { useBookData } from "../context/BookDataContext";

export const AdminIssuePicker = () => {
  const { books, selectedBook, setActiveBookId, createNewBook, deleteBook } = useBookData();
  const [open, setOpen] = useState(false);

  // if (!books.length) {
  //   return null;
  // }

  return (
    <>
      <button
        className="pointer-events-auto fixed top-3 md:top-6 left-3 md:left-6 z-30 flex items-center gap-2 md:gap-3 rounded-full px-2 md:px-4 py-2 glass-chip"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 flex items-center justify-center text-black font-black text-xs md:text-sm shadow-neon">
          SM
        </span>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/70">
            Edit Issues
          </p>
          <p className="text-white font-semibold text-sm truncate max-w-[120px]">
            {selectedBook?.title ?? "Select Issue"}
          </p>
        </div>
      </button>

      {open && (
        <section className="pointer-events-none fixed top-16 md:top-24 left-3 md:left-6 z-30 max-h-[75vh] w-[calc(100vw-1.5rem)] sm:w-80">
          <div className="pointer-events-auto glass-panel glass-scroll rounded-2xl md:rounded-3xl overflow-hidden border border-white/20 shadow-neon">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-white/70">
                Issues Library
              </p>
              <h4 className="text-base md:text-lg font-semibold text-white">Select & Edit</h4>
            </div>
            <ul className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto glass-scroll">
              <li className="p-3 md:p-4">
                <button
                  className="w-full rounded-xl bg-white/10 border border-white/20 py-2.5 md:py-3 text-xs md:text-sm font-semibold text-white hover:bg-white/20 transition flex items-center justify-center gap-2"
                  onClick={async () => {
                    if (confirm("Create a new issue?")) {
                      createNewBook();
                      setOpen(false);
                    }
                  }}
                >
                  <span>+</span> Create New Issue
                </button>
              </li>
              {books.map((book) => (
                <li key={book.id}>
                  <button
                    className={`w-full text-left px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 transition ${selectedBook?.id === book.id
                      ? "bg-white/15 text-white"
                      : "hover:bg-white/5 text-white/80"
                      }`}
                    onClick={() => {
                      setActiveBookId(book.id);
                      setOpen(false);
                    }}
                  >
                    <div className="w-12 h-16 md:w-14 md:h-18 rounded-xl md:rounded-2xl overflow-hidden bg-white/10 flex-shrink-0">
                      <img
                        src={book.heroImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5 md:gap-1 min-w-0">
                      <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/70">
                        {book.issueTag}
                      </p>
                      <p className="text-sm md:text-lg font-semibold truncate">{book.title}</p>
                      <p className="text-xs md:text-sm text-white/70 truncate">{book.subtitle}</p>
                    </div>
                  </button>
                  <button
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-full transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete "${book.title}"? This cannot be undone.`)) {
                        deleteBook(book.id);
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
};



