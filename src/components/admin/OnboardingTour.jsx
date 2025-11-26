import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export const OnboardingTour = ({ isOpen, onClose, setCurrentView }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [targetRect, setTargetRect] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const steps = [
        {
            id: "welcome",
            title: "Welcome to Admin Demo",
            content: "This is a read-only demo of the School Magazine Admin Panel. You can explore all features, but changes won't be saved.",
            targetId: null, // Center
            view: "dashboard",
            mobileContent: "Explore the admin panel demo on mobile. Tap Next to continue.",
        },
        {
            id: "dashboard",
            title: "Dashboard Overview",
            content: "Here you can see recent activity and statistics about your digital issues.",
            targetId: "dashboard-overview-stats",
            view: "dashboard",
            mobileContent: "View your statistics and activity here.",
        },
        {
            id: "nav-issues",
            title: "Manage Issues",
            content: "Click here or press Next to switch to the Issues view, where you can edit books.",
            targetId: "topnav-view-toggles",
            view: "dashboard",
            mobileContent: "Tap the menu to switch between views.",
        },
        {
            id: "sidebar",
            title: "Issue Library",
            content: "This sidebar lists all your digital books. In the full version, you can create new ones here.",
            targetId: isMobile ? null : "sidebar-container", // Skip sidebar highlight on mobile if collapsed
            view: "issues",
            mobileContent: "Your magazine issues are listed here. Tap one to edit.",
        },
        {
            id: "new-issue",
            title: "Create New Issues",
            content: "Use this button to start a new magazine issue. It's disabled in demo mode.",
            targetId: "sidebar-new-issue-btn",
            view: "issues",
            mobileContent: "Create new issues with this button (disabled in demo).",
        },
        {
            id: "editor-sections",
            title: "Content Editor",
            content: "Expand these sections to edit metadata, upload pages, and customize the visual style of the 3D book.",
            targetId: "editor-sections",
            view: "issues",
            mobileContent: "Tap sections below to edit your issue.",
        },
        {
            id: "editor-details",
            title: "Issue Details",
            content: "Edit the title, subtitle, and description of your issue here.",
            targetId: "editor-accordion-details",
            view: "issues",
            mobileContent: "Edit basic info about your issue here.",
            action: () => {
                const btn = document.getElementById('editor-accordion-details');
                if (btn) btn.click();
            }
        },
        {
            id: "editor-pages",
            title: "Pages & Spreads",
            content: "Manage your book's pages here. Upload PDFs or images to create spreads.",
            targetId: "editor-accordion-pages",
            view: "issues",
            mobileContent: "Upload and manage pages here.",
            action: () => {
                const detailsBtn = document.getElementById('editor-accordion-details');
                const pagesBtn = document.getElementById('editor-accordion-pages');
                // Close details first
                if (detailsBtn) detailsBtn.click();
                setTimeout(() => {
                    if (pagesBtn) pagesBtn.click();
                }, 100);
            }
        },
        {
            id: "editor-visuals",
            title: "Visual Settings",
            content: "Customize colors, lighting, and textures for the 3D viewer.",
            targetId: "editor-accordion-visuals",
            view: "issues",
            mobileContent: "Customize your 3D book's appearance.",
            action: () => {
                const pagesBtn = document.getElementById('editor-accordion-pages');
                const visualsBtn = document.getElementById('editor-accordion-visuals');
                // Close pages first
                if (pagesBtn) pagesBtn.click();
                setTimeout(() => {
                    if (visualsBtn) visualsBtn.click();
                }, 100);
            }
        },
        {
            id: "preview",
            title: "Live Preview",
            content: "Click 'Preview' to open the 3D book in a new tab and see your changes immediately.",
            targetId: "editor-preview-btn",
            view: "issues",
            mobileContent: "Preview your 3D book in a new tab.",
        },
        {
            id: "save",
            title: "Save Changes",
            content: "Don't forget to save! In the real app, this persists your work to the database.",
            targetId: "editor-save-btn",
            view: "issues",
            mobileContent: "Save your work (disabled in demo mode).",
        },
        {
            id: "nav-settings",
            title: "Settings",
            content: "Configure global platform settings like school name and logo.",
            targetId: "topnav-view-toggles",
            view: "settings",
            mobileContent: "Access platform settings from the menu.",
        },
        {
            id: "settings-general",
            title: "General Settings",
            content: "Update your organization's branding and logo here.",
            targetId: isMobile ? null : "settings-general", // Settings might be cards, not accordions
            view: "settings",
            mobileContent: "Update branding and organization details.",
        },
        {
            id: "settings-security",
            title: "Security",
            content: "Manage admin credentials and security settings.",
            targetId: isMobile ? null : "settings-security",
            view: "settings",
            mobileContent: "Manage admin access and security.",
        }
    ];

    useEffect(() => {
        if (!isOpen) return;

        const step = steps[currentStep];

        // Switch view if needed
        if (step.view && setCurrentView) {
            setCurrentView(step.view);
        }

        // Execute action if present (e.g. expand accordion)
        const actionTimer = setTimeout(() => {
            if (step.action) {
                step.action();
            }
        }, 400);

        // Wait for render
        const timer = setTimeout(() => {
            if (!step.targetId) {
                setTargetRect(null);
                return;
            }

            const element = document.getElementById(step.targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);

                // Calculate position based on screen size
                if (isMobile) {
                    // On mobile, position tooltip at bottom of screen
                    setPosition({
                        top: window.innerHeight - 250, // Fixed bottom position
                        left: 10
                    });
                } else {
                    // Desktop: position relative to element
                    let top = rect.bottom + 12;
                    let left = rect.left + (rect.width / 2) - 160; // Center 320px card

                    // Boundary checks
                    if (left < 10) left = 10;
                    if (left + 320 > window.innerWidth - 10) left = window.innerWidth - 330;
                    if (top + 200 > window.innerHeight) top = rect.top - 220;

                    setPosition({ top, left });
                }
            } else {
                setTargetRect(null);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            clearTimeout(actionTimer);
        };
    }, [currentStep, isOpen, setCurrentView, isMobile]);

    if (!isOpen) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;
    const displayContent = isMobile && step.mobileContent ? step.mobileContent : step.content;

    return createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 pointer-events-auto" />

            {/* Highlight Target Border */}
            {targetRect && !isMobile && (
                <div
                    className="absolute border-2 border-blue-500 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500 ease-in-out box-content pointer-events-none"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                />
            )}

            {/* Mobile: Arrow pointing up if we have a target */}
            {targetRect && isMobile && (
                <div
                    className="absolute w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-l-transparent border-r-transparent border-b-blue-500 transition-all duration-500 pointer-events-none z-[101]"
                    style={{
                        top: Math.min(targetRect.bottom + 8, window.innerHeight - 250),
                        left: targetRect.left + (targetRect.width / 2) - 12,
                    }}
                />
            )}

            {/* Tooltip Card */}
            <div
                className={`absolute pointer-events-auto transition-all duration-500 ease-in-out ${isMobile ? 'w-[calc(100%-20px)]' : 'w-80'
                    }`}
                style={{
                    top: targetRect ? position.top : '50%',
                    left: targetRect ? position.left : '50%',
                    transform: targetRect ? 'none' : 'translate(-50%, -50%)'
                }}
            >
                <div className={`glass-panel bg-white/95 backdrop-blur-xl border border-white/40 p-4 ${isMobile ? 'rounded-t-2xl' : 'rounded-2xl'
                    } shadow-2xl text-gray-800 relative overflow-hidden ${isMobile && targetRect ? 'shadow-[0_-4px_20px_rgba(0,0,0,0.15)]' : ''
                    }`}>
                    {/* Decorative gradient blob */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                Step {currentStep + 1}/{steps.length}
                            </span>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                aria-label="Close tour"
                            >
                                ✕
                            </button>
                        </div>

                        <h3 className={`font-bold mb-2 text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                            {step.title}
                        </h3>
                        <p className={`text-gray-600 leading-relaxed mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {displayContent}
                        </p>

                        <div className={`flex justify-between items-center pt-3 border-t border-gray-200 ${isMobile ? 'gap-2' : 'gap-4'
                            }`}>
                            <button
                                onClick={onClose}
                                className={`font-medium text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider ${isMobile ? 'text-[10px]' : 'text-xs'
                                    }`}
                            >
                                Skip Tour
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                    disabled={currentStep === 0}
                                    className={`font-medium px-3 py-2 rounded-lg transition-colors ${isMobile ? 'text-xs' : 'text-sm'
                                        } ${currentStep === 0
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {isMobile ? '←' : 'Previous'}
                                </button>

                                <button
                                    onClick={() => {
                                        if (isLast) {
                                            onClose();
                                        } else {
                                            setCurrentStep(currentStep + 1);
                                        }
                                    }}
                                    className={`bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 ${isMobile ? 'text-xs px-4 py-2' : 'text-sm px-5 py-2'
                                        }`}
                                >
                                    {isLast ? "Finish" : "Next"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
