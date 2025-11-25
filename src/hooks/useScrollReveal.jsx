import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered reveal animations
 * Replays animation every time element enters/leaves viewport
 * @param {object} options - Configuration options
 * @returns {object} - Ref and visibility state
 */
export const useScrollReveal = (options = {}) => {
    const {
        threshold = 0.1,      // How much of the element should be visible
        rootMargin = '0px',   // Margin around viewport
        triggerOnce = false   // If true, animation triggers only once
    } = options;

    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isInView = entry.isIntersecting;

                if (triggerOnce) {
                    if (isInView && !hasTriggered) {
                        setIsVisible(true);
                        setHasTriggered(true);
                    }
                } else {
                    // Always update visibility for replay effect
                    setIsVisible(isInView);
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, triggerOnce, hasTriggered]);

    return { ref, isVisible };
};

/**
 * Scroll Reveal Wrapper Component
 * Applies 3D popping neomorphic animation when scrolled into view
 */
export const ScrollReveal = ({
    children,
    className = "",
    animation = "pop", // pop, slide-up, slide-left, slide-right, fade, scale
    delay = 0,
    duration = 600
}) => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

    const animations = {
        pop: isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4',
        'slide-up': isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-12',
        'slide-left': isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-12',
        'slide-right': isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-12',
        fade: isVisible
            ? 'opacity-100'
            : 'opacity-0',
        scale: isVisible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90',
        'extrude': isVisible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90'
    };

    const extrudeStyle = animation === 'extrude' && isVisible
        ? {
            boxShadow: '12px 12px 24px rgba(163,177,198,0.7), -12px -12px 24px rgba(255,255,255,0.9)',
            transform: 'translateZ(20px)'
        }
        : {
            boxShadow: '4px 4px 8px rgba(163,177,198,0.4), -4px -4px 8px rgba(255,255,255,0.6)',
            transform: 'translateZ(0px)'
        };

    return (
        <div
            ref={ref}
            className={`transition-all ease-out ${animations[animation] || animations.pop} ${className}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                ...(animation === 'extrude' ? extrudeStyle : {})
            }}
        >
            {children}
        </div>
    );
};
