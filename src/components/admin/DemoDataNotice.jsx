import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const DemoDataNotice = ({ isDemo, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isDemo) {
            // Show notice after a short delay
            const timer = setTimeout(() => setIsVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isDemo]);

    if (!isDemo || !isVisible) return null;

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
                onClick={onClose}
            />

            {/* Notice Card */}
            <div className="relative z-10 w-full max-w-md m-4 pointer-events-auto animate-slide-up">
                <div className="neo-card p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-4xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]">
                            📊
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-700 text-center mb-3">
                        Demo Mode Active
                    </h2>

                    {/* Message */}
                    <div className="space-y-4 text-sm text-gray-600 mb-6">
                        <p className="text-center leading-relaxed">
                            You are viewing <strong className="text-blue-600">sample analytics data</strong> for demonstration purposes.
                        </p>

                        <div className="neo-card p-4 bg-yellow-50/50">
                            <div className="flex items-start gap-3">
                                <span className="text-xl flex-shrink-0">⚠️</span>
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">This is NOT real data</p>
                                    <p className="text-xs text-gray-600">
                                        All statistics, charts, and metrics shown are randomly generated examples to demonstrate the analytics features.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="neo-card p-4 bg-green-50/50">
                            <div className="flex items-start gap-3">
                                <span className="text-xl flex-shrink-0">✅</span>
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">Real Analytics Available</p>
                                    <p className="text-xs text-gray-600">
                                        Login with your admin account to see actual user engagement data and platform metrics.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 neo-btn text-blue-600 py-3 font-semibold hover:scale-105 transition-transform"
                        >
                            Got it!
                        </button>
                    </div>

                    {/* Footer hint */}
                    <p className="text-xs text-gray-400 text-center mt-4">
                        💡 This notice won't show again during this session
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};
