import { useState } from "react";
import { useBookData } from "../../context/BookDataContext";
import { convertPdfToImages } from "../../lib/pdfUtils";

const PageCard = ({ index, page, bookId, updatePageImage, removePage, canRemove }) => {
    const handleUpload = (e, side) => {
        const file = e.target.files?.[0];
        if (file) updatePageImage(bookId, index, side, file);
        e.target.value = "";
    };

    return (
        <div className="neo-card p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/50 pb-2">
                <div>
                    <h4 className="font-bold text-gray-700">Page {index}</h4>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{page.label}</p>
                </div>
                {canRemove && (
                    <button
                        onClick={() => removePage(bookId, index)}
                        className="text-xs text-red-500 hover:text-red-700 px-3 py-1 rounded-full transition-colors shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]">
                        Remove
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Front Side */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase text-center">Front</p>
                    <div className="aspect-[3/4] bg-[#e0e5ec] rounded-xl overflow-hidden shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] relative group">
                        <img
                            src={page.frontSrc}
                            alt={`Page ${index} Front`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <label className="cursor-pointer neo-btn text-xs px-4 py-2 hover:scale-105 transition-transform">
                                📤 Upload Image
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "front")} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Back Side */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase text-center">Back</p>
                    <div className="aspect-[3/4] bg-[#e0e5ec] rounded-xl overflow-hidden shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] relative group">
                        <img
                            src={page.backSrc}
                            alt={`Page ${index} Back`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <label className="cursor-pointer neo-btn text-xs px-4 py-2 hover:scale-105 transition-transform">
                                📤 Upload Image
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "back")} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PageManager = ({ book }) => {
    const { updatePageImage, addPage, removePage, importPdfPages } = useBookData();
    const pages = book.pages || [];
    const [bulkCount, setBulkCount] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(null);

    const handleBulkAdd = async () => {
        if (bulkCount < 1 || bulkCount > 50) {
            alert("Please enter a number between 1 and 50");
            return;
        }

        setIsAdding(true);
        for (let i = 0; i < bulkCount; i++) {
            await addPage(book.id);
            // Small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        setIsAdding(false);
        setBulkCount(1);
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const images = await convertPdfToImages(file, (current, total) => {
                setImportProgress(`Converting page ${current} of ${total}...`);
            });

            setImportProgress(`Uploading ${images.length} images...`);
            await importPdfPages(book.id, images);

            alert("PDF imported successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to import PDF: " + error.message);
        } finally {
            setIsImporting(false);
            setImportProgress(null);
            e.target.value = "";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Bulk Add & PDF Import */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 p-5 neo-card">
                <div>
                    <h3 className="text-lg font-bold text-gray-700">Pages & Spreads</h3>
                    <p className="text-sm text-gray-500">
                        <span className="font-bold text-blue-500">{pages.length}</span> pages total
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    {/* PDF Import */}
                    <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
                        <label className={`neo-btn px-5 py-2.5 text-sm flex items-center gap-2 text-purple-600 cursor-pointer ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isImporting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    {importProgress || "Importing..."}
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">📄</span>
                                    Import PDF
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={handlePdfUpload}
                                        disabled={isImporting}
                                    />
                                </>
                            )}
                        </label>
                    </div>

                    {/* Bulk Add */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                                Add:
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={bulkCount}
                                onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                                className="w-20 px-3 py-2 rounded-full border-none shadow-[inset_2px_2px_5px_rgba(163,177,198,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] bg-[#e0e5ec] text-center font-semibold text-gray-700 focus:outline-none focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                                disabled={isAdding}
                            />
                            <span className="text-sm text-gray-500">
                                {bulkCount === 1 ? 'spread' : 'spreads'}
                            </span>
                        </div>

                        <button
                            onClick={handleBulkAdd}
                            disabled={isAdding}
                            className={`neo-btn px-5 py-2.5 text-sm flex items-center gap-2 text-blue-600 ${isAdding ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isAdding ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">+</span>
                                    Add
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Pages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page, index) => {
                    // All pages can now be removed
                    const canRemove = true;

                    return (
                        <PageCard
                            key={`${book.id}-${index}`}
                            index={index}
                            page={page}
                            bookId={book.id}
                            updatePageImage={updatePageImage}
                            removePage={removePage}
                            canRemove={canRemove}
                        />
                    );
                })}
            </div>
        </div>
    );
};
