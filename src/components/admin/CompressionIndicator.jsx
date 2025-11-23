import { useState, useEffect } from 'react';

export const CompressionIndicator = ({ show, fileName, progress = 0, stage = 'idle' }) => {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        if (show) {
            setVisible(true);
        } else {
            // Delay hiding to show completion
            const timer = setTimeout(() => setVisible(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!visible) return null;

    const stageMessages = {
        idle: 'Preparing...',
        compressing: 'Compressing image...',
        uploading: 'Uploading...',
        complete: 'Upload complete!',
        error: 'Upload failed'
    };

    const stageColors = {
        idle: 'bg-gray-500',
        compressing: 'bg-blue-500',
        uploading: 'bg-purple-500',
        complete: 'bg-green-500',
        error: 'bg-red-500'
    };

    const isComplete = stage === 'complete';
    const isError = stage === 'error';

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className={`px-6 py-3 ${stageColors[stage]} text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        {!isComplete && !isError && (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {isComplete && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {isError && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span className="font-medium text-sm">
                            {stageMessages[stage]}
                        </span>
                    </div>
                    <span className="text-xs font-semibold">{Math.round(progress)}%</span>
                </div>

                {/* File name */}
                {fileName && (
                    <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs text-gray-600 truncate font-mono">{fileName}</p>
                    </div>
                )}

                {/* Progress bar */}
                <div className="h-2 bg-gray-100">
                    <div
                        className={`h-full transition-all duration-300 ${stageColors[stage]}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Details */}
                {stage === 'compressing' && (
                    <div className="px-6 py-3 bg-blue-50 text-blue-700 text-xs">
                        Converting to WebP format for faster loading...
                    </div>
                )}
                {stage === 'complete' && (
                    <div className="px-6 py-3 bg-green-50 text-green-700 text-xs">
                        Image optimized and uploaded successfully!
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Hook to manage compression progress state
 */
export const useCompressionProgress = () => {
    const [state, setState] = useState({
        show: false,
        fileName: '',
        progress: 0,
        stage: 'idle'
    });

    const startCompression = (fileName) => {
        setState({
            show: true,
            fileName,
            progress: 0,
            stage: 'compressing'
        });
    };

    const updateProgress = ({ stage, percent, fileName }) => {
        setState(prev => ({
            ...prev,
            stage: stage || prev.stage,
            progress: percent || 0,
            fileName: fileName || prev.fileName
        }));
    };

    const complete = () => {
        setState(prev => ({
            ...prev,
            progress: 100,
            stage: 'complete'
        }));

        // Auto-hide after 2 seconds
        setTimeout(() => {
            setState(prev => ({ ...prev, show: false }));
        }, 2000);
    };

    const error = (message) => {
        setState(prev => ({
            ...prev,
            stage: 'error',
            progress: 0
        }));

        // Auto-hide after 3 seconds
        setTimeout(() => {
            setState(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const reset = () => {
        setState({
            show: false,
            fileName: '',
            progress: 0,
            stage: 'idle'
        });
    };

    return {
        state,
        startCompression,
        updateProgress,
        complete,
        error,
        reset
    };
};
