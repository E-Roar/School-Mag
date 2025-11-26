import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { SceneLayout } from "../components/SceneLayout";
import { BookDataProvider, useBookData } from "../context/BookDataContext";
import { UI } from "../components/UI";
import { TopNav } from "../components/TopNav";
import { useBookAnalytics } from "../hooks/useBookAnalytics";

const ViewerContent = () => {
    const { issueId } = useParams();
    const { books, setActiveBookId, selectedBook } = useBookData();

    // Initialize analytics tracking
    const analytics = useBookAnalytics(issueId);

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
        <SceneLayout analytics={analytics}>
            {/* Top Navigation with Like Button */}
            <TopNav bookId={selectedBook.id} bookTitle={selectedBook.title} />

            {/* Bottom Navigation */}
            <UI analytics={analytics} />
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
