import { useState } from 'react';

/**
 * Mobile Menu Component with hamburger toggle
 * @param {boolean} isOpen - Menu open state
 * @param {function} onToggle - Toggle function
 * @param {React.Node} children - Menu items
 */
export const MobileMenu = ({ isOpen, onToggle, children }) => {
    return (
        <>
            {/* Hamburger Button - Only visible on mobile, hidden on desktop */}
            <button
                onClick={onToggle}
                className="md:hidden neo-btn p-2 w-12 h-12 flex flex-col items-center justify-center relative"
                aria-label="Toggle menu"
            >
                {/* Menu Text */}
                <span className="text-[8px] font-bold text-gray-500 mb-0.5 tracking-wider">
                    MENU
                </span>

                {/* Hamburger Lines */}
                <div className="w-5 flex flex-col justify-center gap-1">
                    <span
                        className={`block h-0.5 bg-gray-600 rounded transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''
                            }`}
                    />
                    <span
                        className={`block h-0.5 bg-gray-600 rounded transition-all duration-300 ${isOpen ? 'opacity-0' : ''
                            }`}
                    />
                    <span
                        className={`block h-0.5 bg-gray-600 rounded transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''
                            }`}
                    />
                </div>
            </button>

            {/* Mobile Menu Dropdown - Hidden on desktop */}
            <div
                className={`md:hidden absolute top-full left-0 right-0 bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-4 py-4 space-y-2">
                    {children}
                </div>
            </div>
        </>
    );
};

/**
 * Mobile Menu Item
 */
export const MobileMenuItem = ({ onClick, children, className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-3 rounded-xl text-gray-600 font-semibold hover:bg-white/50 transition-all hover:scale-[1.02] hover:text-blue-500 ${className}`}
        >
            {children}
        </button>
    );
};
