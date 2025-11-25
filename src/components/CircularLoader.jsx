/**
 * Circular Neomorphic Loader with rotation animation
 * Modern, smooth 3D loading animation
 */
export const CircularLoader = ({ size = "lg", text = "Loading...", logoUrl = "" }) => {
    const sizes = {
        sm: "w-16 h-16",
        md: "w-24 h-24",
        lg: "w-32 h-32",
        xl: "w-40 h-40"
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            {/* Rotating Circular Loader */}
            <div className={`${sizes[size]} relative animate-spin-slow`}>
                {/* Outer neomorphic ring */}
                <div className="absolute inset-0 rounded-full bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)]">
                    {/* Inner recessed circle */}
                    <div className="absolute inset-2 rounded-full bg-[#e0e5ec] shadow-[inset_6px_6px_12px_rgba(163,177,198,0.5),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]">
                        {/* Center circle with logo */}
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center p-2">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt="Logo"
                                    className="w-full h-full object-contain rounded-full"
                                    style={{ animation: 'spin-slow 3s linear infinite reverse' }}
                                />
                            ) : (
                                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Rotating accent dots */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                </div>
            </div>

            {/* Loading Text */}
            {text && (
                <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-600 animate-pulse">{text}</p>
                    <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Full Page Circular Loader - NO CARD WRAPPER
 */
export const FullPageLoader = ({ logoUrl = "" }) => {
    return (
        <div className="neo-page flex items-center justify-center min-h-screen">
            <CircularLoader size="xl" text="Loading Library..." logoUrl={logoUrl} />
        </div>
    );
};
