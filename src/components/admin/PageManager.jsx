import { useState } from "react";
import { useBookData } from "../../context/BookDataContext";

const PageCard = ({ index, page, bookId, updatePageImage, removePage, canRemove }) => {
    const [frontUrl, setFrontUrl] = useState("");
    const [backUrl, setBackUrl] = useState("");

    const handleUpload = (e, side) => {
        const file = e.target.files?.[0];
        if (file) updatePageImage(bookId, index, side, file);
        e.target.value = "";
    };

    const handleUrlSubmit = (side) => {
        const url = side === "front" ? frontUrl : backUrl;
        if (url.trim()) {
            updatePageImage(bookId, index, side, url.trim());
            side === "front" ? setFrontUrl("") : setBackUrl("");
        }
    };

    return (
        <div className="glass-card p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                    <h4 className="font-bold text-gray-800">Page {index}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{page.label}</p>
                </div>
                {canRemove && (
                    <button
                        onClick={() => removePage(bookId, index)}
                        className="text-xs text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-colors border border-red-100"
                    >
                        Remove
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Front Side */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase text-center">Front</p>
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                        <img
                            src={page.frontSrc}
                            alt={`Page ${index} Front`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform">
                                Change Image
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "front")} />
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={frontUrl}
                            onChange={(e) => setFrontUrl(e.target.value)}
                            placeholder="Or paste URL"
                            className="glass-input py-1 text-xs"
                        />
                        <button
                            onClick={() => handleUrlSubmit("front")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium"
                        >
                            Use
                        </button>
                    </div>
                </div>

                {/* Back Side */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase text-center">Back</p>
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                        <img
                            src={page.backSrc}
                            alt={`Page ${index} Back`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform">
                                Change Image
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "back")} />
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={backUrl}
                            onChange={(e) => setBackUrl(e.target.value)}
                            placeholder="Or paste URL"
                            className="glass-input py-1 text-xs"
                        />
                        <button
                            onClick={() => handleUrlSubmit("back")}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium"
                        >
                            Use
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PageManager = ({ book }) => {
    const { updatePageImage, addPage, removePage } = useBookData();
    const pages = book.pages || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Pages & Spreads</h3>
                    <p className="text-sm text-gray-500">{pages.length} pages total</p>
                </div>
                <button
                    onClick={() => addPage(book.id)}
                    className="glass-btn-primary px-4 py-2 text-sm flex items-center gap-2"
                >
                    <span>+</span> Add Spread
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page, index) => {
                    const isCover = index === 0;
                    const canRemove = !isCover;

                    // Override label for clarity if it's the cover
                    const displayLabel = isCover ? "Front Cover (Fixed)" : page.label;

                    return (
                        <PageCard
                            key={`${book.id}-${index}`}
                            index={index}
                            page={{ ...page, label: displayLabel }}
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
