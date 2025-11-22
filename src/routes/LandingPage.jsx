import { Link } from "react-router-dom";
import { useBookData } from "../context/BookDataContext";
import { useState } from "react";

export const LandingPage = () => {
    const { books, isLoading } = useBookData();
    const [searchQuery, setSearchQuery] = useState("");

    const publishedBooks = books || [];
    const latestBook = publishedBooks.length > 0
        ? [...publishedBooks].sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))[0]
        : null;

    const filteredBooks = publishedBooks.filter(book =>
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="gradient-bg">
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <p style={{ fontSize: '1.25rem' }}>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Fixed Background Layer */}
            <div className="gradient-bg" />

            {/* Scrollable Content Layer */}
            <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
                <header className="glass-card-light" style={{ position: 'sticky', top: 0, zIndex: 50, margin: '1rem', borderRadius: '1rem' }}>
                    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }} className="text-gradient">E-Roar Magazine</h1>
                        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="search"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="glass-input"
                                style={{ maxWidth: '15rem' }}
                            />
                            <Link to="/admin" className="glass-btn">Admin</Link>
                        </nav>
                    </div>
                </header>

                {latestBook && (
                    <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
                        <div className="glass-panel fade-in">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                                <div>
                                    <img
                                        src={latestBook.pages?.[0]?.frontSrc || "/textures/DSC00933.jpg"}
                                        alt={latestBook.title}
                                        style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '1rem' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="glass-badge-blue" style={{ display: 'inline-block', alignSelf: 'flex-start' }}>Latest Issue</div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }} className="text-gradient">{latestBook.title}</h2>
                                    {latestBook.subtitle && <p style={{ fontSize: '1.25rem', color: '#374151' }}>{latestBook.subtitle}</p>}
                                    <Link to={`/view/${latestBook.id}`} className="glass-btn-primary" style={{ display: 'inline-block', alignSelf: 'flex-start' }}>Read Now →</Link>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
                    <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>All Issues</h3>
                    {filteredBooks.length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>No issues found</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }} className="stagger-children">
                            {filteredBooks.map((book) => (
                                <Link
                                    key={book.id}
                                    to={`/view/${book.id}`}
                                    className="glass-card"
                                    style={{ cursor: 'pointer', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div>
                                        <img
                                            src={book.pages?.[0]?.frontSrc || "/textures/DSC00933.jpg"}
                                            alt={book.title}
                                            style={{ width: '100%', height: '14rem', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{book.title}</h4>
                                        {book.subtitle && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{book.subtitle}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <footer className="glass-card-light" style={{ margin: '1rem', borderRadius: '1rem' }}>
                    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center', color: '#6b7280' }}>
                        <p>© 2025 E-Roar Magazine</p>
                    </div>
                </footer>
            </div>
        </>
    );
};
