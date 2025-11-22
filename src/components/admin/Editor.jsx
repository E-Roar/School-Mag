import { useState } from "react";
import { Link } from "react-router-dom";
import { useBookData } from "../../context/BookDataContext";
import { PageManager } from "./PageManager";
import { VisualSettings } from "./VisualSettings";
import { IssueDetails } from "./IssueDetails";

export const Editor = () => {
    const { selectedBook, refetch, isLoading } = useBookData();
    const [activeTab, setActiveTab] = useState("details");
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");

    if (!selectedBook) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <p className="text-xl mb-2">No Issue Selected</p>
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

    const tabs = [
        { id: "details", label: "Details" },
        { id: "pages", label: "Pages" },
        { id: "visuals", label: "Visuals" },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="glass-card-light m-4 mb-0 p-4 flex items-center justify-between rounded-2xl z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{selectedBook.title}</h1>
                    <p className="text-sm text-gray-500">{selectedBook.subtitle || "No subtitle"}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white/50 p-1 rounded-xl border border-white/20">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? "bg-white shadow-sm text-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <Link
                        to={`/view/${selectedBook.id}`}
                        target="_blank"
                        className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-white/50 hover:bg-white text-gray-700 transition-all border border-white/20"
                    >
                        Preview ↗
                    </Link>

                    <button
                        onClick={handleSave}
                        disabled={saving || isLoading}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${saveStatus === "success"
                                ? "bg-green-500 text-white"
                                : saveStatus === "error"
                                    ? "bg-red-500 text-white"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {saving ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Changes"}
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6 pb-20">
                    {activeTab === "details" && <IssueDetails book={selectedBook} />}
                    {activeTab === "pages" && <PageManager book={selectedBook} />}
                    {activeTab === "visuals" && <VisualSettings book={selectedBook} />}
                </div>
            </div>
        </div>
    );
};
