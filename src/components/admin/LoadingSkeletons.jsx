/**
 * Loading Skeleton Components
 * Provides visual feedback during data loading
 */

export const SkeletonCard = ({ className = "" }) => (
    <div className={`neo-card p-6 animate-pulse ${className}`}>
        <div className="h-4 bg-gray-300/50 rounded-full w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-300/50 rounded-full w-3/4"></div>
    </div>
);

export const SkeletonStatCard = () => (
    <div className="neo-card p-6 flex items-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-300/50"></div>
        <div className="flex-1">
            <div className="h-3 bg-gray-300/50 rounded-full w-20 mb-2"></div>
            <div className="h-6 bg-gray-300/50 rounded-full w-16"></div>
        </div>
    </div>
);

export const SkeletonChart = ({ height = 250 }) => (
    <div className="neo-card p-6 animate-pulse">
        <div className="h-4 bg-gray-300/50 rounded-full w-32 mb-4"></div>
        <div className={`bg-gray-200/50 rounded-xl flex items-end justify-around gap-2 p-4`} style={{ height }}>
            {[60, 80, 70, 90, 75, 85].map((h, i) => (
                <div
                    key={i}
                    className="flex-1 bg-gray-300/50 rounded-t-md"
                    style={{ height: `${h}%` }}
                />
            ))}
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
    <div className="neo-card p-6 animate-pulse">
        <div className="h-4 bg-gray-300/50 rounded-full w-40 mb-6"></div>
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <div className="w-2 h-2 bg-gray-300/50 rounded-full mt-2"></div>
                    <div className="flex-1">
                        <div className="h-3 bg-gray-300/50 rounded-full w-full mb-2"></div>
                        <div className="h-2 bg-gray-300/50 rounded-full w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SkeletonGrid = ({ cols = 3, rows = 2 }) => (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
        {Array.from({ length: cols * rows }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);
