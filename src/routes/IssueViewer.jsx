import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { SceneLayout } from "../components/SceneLayout";
import { BookDataProvider, useBookData } from "../context/BookDataContext";
import { UI } from "../components/UI";

const ViewerContent = () => {
    const { issueId } = useParams();
    const { books, setActiveBookId, selectedBook } = useBookData();

    useEffect(() => {
        if (issueId && books.length > 0) {
            setActiveBookId(issueId);
        }
    }, [issueId, books, setActiveBookId]);

    if (!selectedBook) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
                <p>Loading issue...</p>
            </div>
        );
    }

    return (
        <SceneLayout>
            <UI />
            {/* Back Button */}
            <Link
                to="/"
                className="fixed top-6 left-6 z-50 glass-btn-icon text-black hover:scale-110 transition-transform"
                title="Back to Library"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </Link>
        </SceneLayout>
    );
};

export const IssueViewer = () => {
    const { issueId } = useParams();
    return (
        <BookDataProvider isAdminMode={false} bookIdToInclude={issueId}>
            <ViewerContent />
        </BookDataProvider>
    );
};
