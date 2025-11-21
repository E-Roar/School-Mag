import { useMemo, useState } from "react";
import { useBookData } from "../context/BookDataContext";

export const Landing = () => {
  const { books, selectedBook, setActiveBookId } = useBookData();
  const [isOpen, setIsOpen] = useState(false);

  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      const aDate = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const bDate = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return bDate - aDate;
    });
  }, [books]);

  if (!books.length) {
    return null;
  }

  return (
    <>
      <button
        className="pointer-events-auto fixed top-6 left-6 z-30 rounded-full bg-black/70 text-white border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.35em] hover:bg-black/90 transition"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? "Close Issues" : "Issues"}
      </button>

      {isOpen && (
        <section className="pointer-events-none fixed top-20 left-6 z-20 max-h-[75vh] w-96">
          <div className="pointer-events-auto w-full glass-panel text-white rounded-3xl border border-white/15 shadow-neon overflow-hidden flex flex-col glass-scroll">
            <header className="px-6 py-4 border-b border-white/10">
              <p className="text-xs uppercase tracking-[0.45em] text-white/60">
                Choose an issue to preview
              </p>
            </header>
            <div className="overflow-y-auto">
              <ul className="flex flex-col divide-y divide-white/5">
                {sortedBooks.map((book) => (
                  <li key={book.id}>
                    <button
                      className={`w-full text-left px-6 py-4 flex gap-4 items-center hover:bg-white/10 transition ${
                        book.id === selectedBook?.id ? "bg-white/10" : ""
                      }`}
                      onClick={() => {
                        setActiveBookId(book.id);
                        setIsOpen(false);
                      }}
                    >
                      <div className="w-16 h-20 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0">
                        <img
                          src={book.heroImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                          {book.issueTag}
                        </p>
                        <p className="text-lg font-semibold">{book.title}</p>
                        <p className="text-sm text-white/70">{book.subtitle}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

