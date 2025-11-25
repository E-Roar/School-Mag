import { useState } from 'react';

/**
 * Neomorphic Logo Component with hover and click animations
 * @param {string} logoUrl - URL of the logo image
 * @param {string} alt - Alt text for the logo
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {number} customSize - Custom size in pixels (overrides size prop)
 * @param {function} onClick - Optional click handler
 * @param {boolean} animated - Whether to show animations (default: true)
 */
export const NeomorphicLogo = ({
    logoUrl,
    alt = "Logo",
    size = "md",
    customSize = null,
    onClick,
    animated = true,
    className = ""
}) => {
    const [isPressed, setIsPressed] = useState(false);

    const sizes = {
        sm: "w-12 h-12 p-2",
        md: "w-16 h-16 p-3",
        lg: "w-24 h-24 p-4",
        xl: "w-32 h-32 p-5"
    };

    const handleMouseDown = () => {
        if (animated) setIsPressed(true);
    };

    const handleMouseUp = () => {
        if (animated) setIsPressed(false);
    };

    const handleClick = () => {
        if (onClick) onClick();
    };

    // Use custom size if provided, otherwise use preset size
    const sizeStyle = customSize ? {
        width: `${customSize}px`,
        height: `${customSize}px`,
        padding: `${Math.max(4, customSize * 0.15)}px`
    } : {};

    const baseClasses = `
        rounded-2xl 
        bg-[#e0e5ec] 
        flex items-center justify-center
        transition-all duration-300
        ${customSize ? '' : (sizes[size] || sizes.md)}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
    `;

    const shadowClasses = isPressed
        ? "shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.8)]"
        : "shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,0.9)]";

    const scaleClasses = animated
        ? isPressed
            ? "scale-95"
            : "hover:scale-105"
        : "";

    if (!logoUrl) {
        // Fallback placeholder
        return (
            <div className={`${baseClasses} ${shadowClasses} ${scaleClasses}`} style={sizeStyle}>
                <span className="text-2xl font-bold text-blue-500">M</span>
            </div>
        );
    }

    return (
        <div
            className={`${baseClasses} ${shadowClasses} ${scaleClasses} group relative overflow-hidden`}
            style={sizeStyle}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <img
                src={logoUrl}
                alt={alt}
                className="max-w-full max-h-full object-contain z-10 relative"
            />

            {/* Glossy overlay effect on hover */}
            {animated && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            )}

            {/* Subtle inner glow on hover */}
            {animated && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        boxShadow: 'inset 0 0 20px rgba(99, 102, 241, 0.1)'
                    }}
                />
            )}
        </div>
    );
};

/**
 * Extruded Neomorphic Logo with 3D effect
 */
export const ExtrudedLogo = ({
    logoUrl,
    alt = "Logo",
    size = "xl",
    onClick
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const sizes = {
        md: "w-20 h-20 p-4",
        lg: "w-28 h-28 p-5",
        xl: "w-40 h-40 p-6",
        xxl: "w-56 h-56 p-8"
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    const extrusionDepth = isPressed ? 2 : isHovered ? 12 : 8;

    const extrusionShadow = `
        ${extrusionDepth}px ${extrusionDepth}px ${extrusionDepth * 2}px rgba(163,177,198,0.6),
        -${extrusionDepth}px -${extrusionDepth}px ${extrusionDepth * 2}px rgba(255,255,255,0.8),
        inset ${isPressed ? 3 : 0}px ${isPressed ? 3 : 0}px ${isPressed ? 6 : 0}px rgba(163,177,198,${isPressed ? 0.4 : 0}),
        inset -${isPressed ? 3 : 0}px -${isPressed ? 3 : 0}px ${isPressed ? 6 : 0}px rgba(255,255,255,${isPressed ? 0.6 : 0})
    `;

    if (!logoUrl) {
        return (
            <div
                className={`${sizes[size]} rounded-3xl bg-[#e0e5ec] flex items-center justify-center transition-all duration-300`}
                style={{ boxShadow: extrusionShadow }}
            >
                <span className="text-4xl font-bold text-blue-500">M</span>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Glow effect behind */}
            <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-2xl transition-all duration-500 ${isHovered ? 'scale-110 opacity-100' : 'scale-90 opacity-0'
                    }`}
            />

            {/* Main logo */}
            <div
                className={`${sizes[size]} rounded-3xl bg-[#e0e5ec] flex items-center justify-center transition-all duration-300 cursor-pointer relative z-10 ${isPressed ? 'scale-95' : isHovered ? 'scale-105' : 'scale-100'
                    }`}
                style={{ boxShadow: extrusionShadow }}
                onClick={onClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setIsPressed(false);
                }}
                onMouseEnter={() => setIsHovered(true)}
            >
                <img
                    src={logoUrl}
                    alt={alt}
                    className={`max-w-full max-h-full object-contain transition-all duration-300 ${isPressed ? 'brightness-95' : isHovered ? 'brightness-110' : 'brightness-100'
                        }`}
                />

                {/* Glossy overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl pointer-events-none"
                    style={{
                        opacity: isHovered ? 1 : 0.5,
                        transition: 'opacity 0.3s'
                    }}
                />
            </div>
        </div>
    );
};
