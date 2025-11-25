import { Link } from "react-router-dom";
import { useBookData } from "../context/BookDataContext";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export const LandingPage = () => {
    const { books, isLoading } = useBookData();
    const [searchQuery, setSearchQuery] = useState("");
    const [settings, setSettings] = useState({
        school_name: "E-Roar Magazine",
        school_logo_url: "",
        school_description: ""
    });
    const [suggestion, setSuggestion] = useState("");
    const [suggestionStatus, setSuggestionStatus] = useState(""); // idle, submitting, success, error

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('*')
                    .single();
                if (data) {
                    setSettings(data);
                    if (data.school_name) {
                        document.title = data.school_name;
                    }
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();
        if (!suggestion.trim()) return;

        setSuggestionStatus("submitting");
        try {
            const { error } = await supabase
                .from('suggestions')
                .insert([{ content: suggestion }]);

            if (error) throw error;

            setSuggestionStatus("success");
            setSuggestion("");
            setTimeout(() => setSuggestionStatus(""), 3000);
        } catch (err) {
            console.error("Error submitting suggestion:", err);
            setSuggestionStatus("error");
        }
    };

    const publishedBooks = books || [];
    const latestBook = publishedBooks.length > 0
        ? [...publishedBooks].sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))[0]
        : null;

    const filteredBooks = publishedBooks.filter(book =>
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Custom Smooth Scroll with Ease-In-Out
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (!element) return;

        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000; // 1 second duration
        let start = null;

        // Easing function: easeInOutCubic
        const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            const ease = easeInOutCubic(percentage);

            window.scrollTo(0, startPosition + distance * ease);

            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    };

    if (isLoading) {
        return (
            <div className="neo-page flex items-center justify-center">
                <div className="neo-card p-8 animate-pulse">
                    <p className="text-xl font-bold text-gray-500">Loading Library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="neo-page min-h-screen flex flex-col font-sans text-gray-700">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 px-4 py-4 bg-[#e0e5ec]/90 backdrop-blur-md transition-all duration-300">
                <div className="neo-card max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
                    {/* Logo & Name */}
                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        {settings.school_logo_url ? (
                            <div className="w-10 h-10 flex items-center justify-center p-1 neo-frame group-hover:scale-105 transition-transform duration-300">
                                <img
                                    src={settings.school_logo_url}
                                    alt="Logo"
                                    className="w-full h-full object-contain rounded-md"
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] flex items-center justify-center shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.8)] group-hover:scale-105 transition-transform duration-300">
                                <span className="text-lg font-bold text-blue-500">M</span>
                            </div>
                        )}
                        <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-700 hidden sm:block group-hover:text-blue-600 transition-colors">
                            {settings.school_name}
                        </h1>
                    </div>

                    {/* Main Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <button onClick={() => scrollToSection('hero')} className="text-sm font-semibold text-gray-600 hover:text-blue-500 transition-colors hover:scale-105 transform duration-200">Home</button>
                        <button onClick={() => scrollToSection('about')} className="text-sm font-semibold text-gray-600 hover:text-blue-500 transition-colors hover:scale-105 transform duration-200">About</button>
                        <button onClick={() => scrollToSection('library')} className="text-sm font-semibold text-gray-600 hover:text-blue-500 transition-colors hover:scale-105 transform duration-200">Library</button>
                        <button onClick={() => scrollToSection('suggestions')} className="text-sm font-semibold text-gray-600 hover:text-blue-500 transition-colors hover:scale-105 transform duration-200">Feedback</button>
                    </div>

                    {/* Search & Admin */}
                    <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
                        <div className="relative hidden sm:block w-full max-w-[200px]">
                            <input
                                type="search"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="neo-input py-2 text-sm focus:w-60 transition-all duration-300"
                            />
                        </div>
                        <Link to="/admin" className="neo-btn text-xs px-4 py-2 text-blue-600 hover:scale-105 transition-transform">
                            Admin
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 space-y-24 py-12">

                {/* Hero Section */}
                <section id="hero" className="flex flex-col md:flex-row items-center gap-12 md:gap-20 min-h-[60vh]">
                    <div className="w-full md:w-1/2 space-y-8 text-center md:text-left order-2 md:order-1">
                        <div className="inline-block px-4 py-1 rounded-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] animate-fade-in-up">
                            <span className="text-sm font-bold text-blue-500 tracking-wider uppercase">Welcome to the Future</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-bold text-gray-700 tracking-tighter leading-tight animate-fade-in-up delay-100">
                            Read. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Experience.</span> Inspire.
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto md:mx-0 animate-fade-in-up delay-200">
                            {settings.school_description || "Discover a new dimension of storytelling. Immerse yourself in our interactive 3D magazine collection, featuring student works, school events, and creative arts."}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 animate-fade-in-up delay-300">
                            {latestBook && (
                                <Link to={`/view/${latestBook.id}`} className="neo-btn text-blue-600 px-8 py-4 text-lg font-bold hover:scale-105 transition-transform">
                                    Read Latest Issue
                                </Link>
                            )}
                            <button onClick={() => scrollToSection('library')} className="px-6 py-3 rounded-full text-gray-600 font-semibold hover:bg-white/50 transition-all hover:scale-105">
                                Browse Archive ↓
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 flex justify-center order-1 md:order-2">
                        {latestBook ? (
                            <div className="relative w-64 md:w-80 aspect-[3/4] animate-float cursor-pointer" onClick={() => window.location.href = `/view/${latestBook.id}`}>
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transform translate-y-10 scale-90"></div>
                                <div className="neo-frame w-full h-full p-2 relative z-10 transform rotate-[-5deg] hover:rotate-0 hover:scale-105 transition-all duration-500">
                                    <img
                                        src={latestBook.pages?.[0]?.frontSrc || "/textures/DSC00933.jpg"}
                                        alt="Latest Cover"
                                        className="w-full h-full object-cover rounded-lg shadow-inner"
                                    />
                                    {/* Glossy overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 rounded-lg pointer-events-none"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-64 h-80 neo-card flex items-center justify-center">
                                <p className="text-gray-400">No issues published yet</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* About / Info Section */}
                <section id="about" className="py-12">
                    <div className="neo-card p-8 md:p-12">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="text-center space-y-4 p-4 rounded-2xl transition-all duration-300 hover:bg-[#e0e5ec] hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.8)] group cursor-default">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.8)] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                                    🚀
                                </div>
                                <h3 className="text-xl font-bold text-gray-700">Innovation</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Pushing the boundaries of digital reading with interactive 3D technology and immersive audio-visual experiences.
                                </p>
                            </div>
                            <div className="text-center space-y-4 p-4 rounded-2xl transition-all duration-300 hover:bg-[#e0e5ec] hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.8)] group cursor-default">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.8)] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                                    🎨
                                </div>
                                <h3 className="text-xl font-bold text-gray-700">Creativity</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    A canvas for students to express themselves through writing, art, photography, and design.
                                </p>
                            </div>
                            <div className="text-center space-y-4 p-4 rounded-2xl transition-all duration-300 hover:bg-[#e0e5ec] hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.8)] group cursor-default">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.8)] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                                    🌍
                                </div>
                                <h3 className="text-xl font-bold text-gray-700">Community</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Connecting students, teachers, and parents through shared stories and school achievements.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Library Section */}
                <section id="library" className="space-y-10">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-4 px-2">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-700 mb-2">Issue Archive</h3>
                            <p className="text-gray-500">Explore our collection of past and present releases.</p>
                        </div>
                        <div className="text-sm text-gray-400 font-medium px-4 py-2 rounded-full bg-[#e0e5ec] shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]">
                            {filteredBooks.length} Issues Found
                        </div>
                    </div>

                    {filteredBooks.length === 0 ? (
                        <div className="neo-card p-16 text-center">
                            <p className="text-xl text-gray-400">No issues found matching your search.</p>
                            <button onClick={() => setSearchQuery("")} className="mt-4 text-blue-500 hover:underline">Clear Search</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredBooks.map((book) => (
                                <Link
                                    key={book.id}
                                    to={`/view/${book.id}`}
                                    className="group block"
                                >
                                    <div className="neo-card p-4 h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)]">
                                        {/* Cover Image Container */}
                                        <div className="neo-frame aspect-[3/4] mb-4 overflow-hidden bg-gray-100 relative">
                                            <img
                                                src={book.pages?.[0]?.frontSrc || "/textures/DSC00933.jpg"}
                                                alt={book.title}
                                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">{book.issueTag || "Issue"}</span>
                                                <span className="text-xs text-gray-400">{book.releaseDate ? new Date(book.releaseDate).toLocaleDateString() : ""}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                {book.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                                {book.subtitle}
                                            </p>

                                            <div className="pt-4 border-t border-gray-200/50 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-400">Read Now</span>
                                                <span className="w-8 h-8 rounded-full bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.8)] flex items-center justify-center text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                                                    →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Suggestions Section */}
                <section id="suggestions" className="max-w-3xl mx-auto w-full">
                    <div className="neo-card p-8 md:p-12 relative overflow-hidden transition-all duration-300 hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,0.9)]">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full opacity-50 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="text-center mb-10">
                                <h3 className="text-2xl font-bold text-gray-700 mb-3">Anonymous Suggestions</h3>
                                <p className="text-gray-500">
                                    Help us improve! Share your ideas, feedback, or feature requests for the platform.
                                    Your input is completely anonymous.
                                </p>
                            </div>

                            <form onSubmit={handleSuggestionSubmit} className="space-y-6">
                                <div>
                                    <textarea
                                        value={suggestion}
                                        onChange={(e) => setSuggestion(e.target.value)}
                                        placeholder="I think it would be cool if..."
                                        rows={5}
                                        className="neo-input w-full resize-none rounded-2xl p-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        type="submit"
                                        disabled={suggestionStatus === "submitting"}
                                        className={`neo-btn px-10 py-3 text-blue-600 font-bold tracking-wide hover:scale-105 transition-transform ${suggestionStatus === "submitting" ? "opacity-70 cursor-wait" : ""
                                            }`}
                                    >
                                        {suggestionStatus === "submitting" ? "Sending..." : "Submit Suggestion"}
                                    </button>
                                </div>

                                {/* Status Messages */}
                                {suggestionStatus === "success" && (
                                    <div className="text-center p-3 rounded-lg bg-green-50 text-green-600 text-sm font-medium animate-fade-in">
                                        Thank you! Your suggestion has been received.
                                    </div>
                                )}
                                {suggestionStatus === "error" && (
                                    <div className="text-center p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium animate-fade-in">
                                        Oops! Something went wrong. Please try again later.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="mt-20 py-12 bg-[#e0e5ec] border-t border-white/50">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
                    <div className="flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gray-300"></div>
                        <span className="font-bold text-gray-400">{settings.school_name}</span>
                    </div>
                    <div className="flex justify-center gap-8 text-sm text-gray-500">
                        <button onClick={() => scrollToSection('hero')} className="hover:text-blue-500 transition-colors hover:scale-105 transform">Home</button>
                        <button onClick={() => scrollToSection('library')} className="hover:text-blue-500 transition-colors hover:scale-105 transform">Library</button>
                        <button onClick={() => scrollToSection('suggestions')} className="hover:text-blue-500 transition-colors hover:scale-105 transform">Feedback</button>
                        <Link to="/admin" className="hover:text-blue-500 transition-colors hover:scale-105 transform">Admin Login</Link>
                    </div>
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} {settings.school_name}. Powered by E-Roar Platform.
                    </p>
                </div>
            </footer>
        </div>
    );
};
