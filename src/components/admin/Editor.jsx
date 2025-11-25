import { useState } from "react";
import { Link } from "react-router-dom";
import { useBookData } from "../../context/BookDataContext";
import { PageManager } from "./PageManager";
import { VisualSettings } from "./VisualSettings";
import { IssueDetails } from "./IssueDetails";

export const Editor = () => {
    const { selectedBook, refetch, isLoading } = useBookData();
    const [openSections, setOpenSections] = useState({
        details: true,
        pages: false,
        visuals: false
    });
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");

    if (!selectedBook) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#e0e5ec]">
                <div className="text-center">
                    <p className="text-xl mb-2 font-bold text-gray-500">No Issue Selected</p>
                    <p className="text-sm">Select an issue from the sidebar to edit</p>
                </div>
            </div>
        );
    }

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus("");
        try {
            await refetch();
            setSaveStatus("success");
            setTimeout(() => setSaveStatus(""), 3000);
        } catch (error) {
            console.error("Error saving:", error);
            setSaveStatus("error");
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const accordionSections = [
        {
            id: "details",
            label: "Issue Details",
            icon: "📝",
            description: "Basic information and metadata",
            component: <IssueDetails book={selectedBook} />
        },
        {
            id: "pages",
            label: "Pages & Spreads",
            icon: "📚",
            description: `${selectedBook.pages?.length || 0} pages`,
            component: <PageManager book={selectedBook} />
        },
        {
            id: "visuals",
            label: "Visual Settings",
            icon: "🎨",
            description: "Colors, animations, and appearance",
            component: <VisualSettings book={selectedBook} />
        },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#e0e5ec]">
            {/* Header */}
            <header className="neo-card m-4 mb-0 p-4 flex items-center justify-between rounded-2xl z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-700">{selectedBook.title}</h1>
                    <p className="text-sm text-gray-500">{selectedBook.subtitle || "No subtitle"}</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to={`/view/${selectedBook.id}`}
                        target="_blank"
                        className="neo-btn text-gray-600 text-sm px-4 py-2"
                    >
                        Preview ↗
                    </Link>

                    <button
                        onClick={handleSave}
                        disabled={saving || isLoading}
                        className={`neo-btn text-sm px-6 py-2 transition-all ${saveStatus === "success"
                            ? "text-green-500 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                            : saveStatus === "error"
                                ? "text-red-500"
                                : "text-blue-600"
                            }`}
                    >
                        {saving ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Changes"}
                    </button>
                </div>
            </header>

            {/* Accordion Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6 pb-20">
                    {accordionSections.map((section) => (
                        <div
                            key={section.id}
                            className="neo-card overflow-hidden transition-all duration-300"
                        >
                            {/* Accordion Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full p-6 flex items-center justify-between hover:bg-white/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl filter drop-shadow-md">{section.icon}</span>
                                    <div className="text-left">
                                        <h3 className="text-lg font-bold text-gray-700">{section.label}</h3>
                                        <p className="text-sm text-gray-500">{section.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${openSections[section.id] ? 'text-blue-500' : 'text-gray-400'}`}>
                                        {openSections[section.id] ? 'Collapse' : 'Expand'}
                                    </span>
                                    <svg
                                        className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${openSections[section.id] ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Accordion Content */}
                            <div
                                className={`transition-all duration-300 ease-in-out ${openSections[section.id]
                                    ? 'max-h-[5000px] opacity-100'
                                    : 'max-h-0 opacity-0 overflow-hidden'
                                    }`}
                            >
                                <div className="p-6 pt-0 border-t border-gray-200/50">
                                    {section.component}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
