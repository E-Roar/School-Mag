import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export const OnboardingTour = ({ isOpen, onClose, setCurrentView }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [targetRect, setTargetRect] = useState(null);

    const steps = [
        {
            id: "welcome",
            title: "Welcome to Admin Demo",
            content: "This is a read-only demo of the School Magazine Admin Panel. You can explore all features, but changes won't be saved.",
            targetId: null, // Center
            view: "dashboard"
        },
        {
            id: "dashboard",
            title: "Dashboard Overview",
            content: "Here you can see recent activity and statistics about your digital issues.",
            targetId: "dashboard-overview-stats",
            view: "dashboard"
        },
        {
            id: "nav-issues",
            title: "Manage Issues",
            content: "Click here or press Next to switch to the Issues view, where you can edit books.",
            targetId: "topnav-view-toggles",
            view: "dashboard"
        },
        {
            id: "sidebar",
            title: "Issue Library",
            content: "This sidebar lists all your digital books. In the full version, you can create new ones here.",
            targetId: "sidebar-container",
            view: "issues"
        },
        {
            id: "new-issue",
            title: "Create New Issues",
            content: "Use this button to start a new magazine issue. It's disabled in demo mode.",
            targetId: "sidebar-new-issue-btn",
            view: "issues"
        },
        {
            id: "editor-sections",
            title: "Content Editor",
            content: "Expand these sections to edit metadata, upload pages, and customize the visual style of the 3D book.",
            targetId: "editor-sections",
            view: "issues"
        },
        {
            id: "editor-details",
            title: "Issue Details",
            content: "Edit the title, subtitle, and description of your issue here.",
            targetId: "editor-accordion-details",
            view: "issues",
            action: () => {
                const btn = document.getElementById('editor-accordion-details');
                // Check if not expanded (simple heuristic or just click it if we assume it starts closed? Better to just click if we want to toggle)
                // But we want to ensure it's OPEN.
                // Since we don't have access to the state, we can just highlight it.
                // OR, we can try to click it.
                if (btn) btn.click();
            }
        },
        {
            id: "editor-pages",
            title: "Pages & Spreads",
            content: "Manage your book's pages here. Upload PDFs or images to create spreads.",
            targetId: "editor-accordion-pages",
            view: "issues",
            action: () => {
                const btn = document.getElementById('editor-accordion-pages');
                if (btn) btn.click();
            }
        },
        {
            id: "editor-visuals",
            title: "Visual Settings",
            content: "Customize colors, lighting, and textures for the 3D viewer.",
            targetId: "editor-accordion-visuals",
            view: "issues",
            action: () => {
                const btn = document.getElementById('editor-accordion-visuals');
                if (btn) btn.click();
            }
        },
        {
            id: "preview",
            title: "Live Preview",
            content: "Click 'Preview' to open the 3D book in a new tab and see your changes immediately.",
            targetId: "editor-preview-btn",
            view: "issues"
        },
        {
            id: "save",
            title: "Save Changes",
            content: "Don't forget to save! In the real app, this persists your work to the database.",
            targetId: "editor-save-btn",
            view: "issues"
        },
        {
            id: "nav-settings",
            title: "Settings",
            content: "Configure global platform settings like school name and logo.",
            targetId: "topnav-view-toggles", // Point to nav again but switch view
            view: "settings"
        },
        {
            id: "settings-general",
            title: "General Settings",
            content: "Update your organization's branding and logo here.",
            targetId: "settings-general",
            view: "settings"
        },
        {
            id: "settings-security",
            title: "Security",
            content: "Manage admin credentials and security settings.",
            targetId: "settings-security",
            view: "settings"
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
        // We use a small timeout to allow view transition
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

                // Calculate position (default: bottom center of element)
                let top = rect.bottom + 12;
                let left = rect.left + (rect.width / 2) - 160; // Center 320px card

                // Boundary checks
                if (left < 10) left = 10;
                if (left + 320 > window.innerWidth - 10) left = window.innerWidth - 330;
                if (top + 200 > window.innerHeight) top = rect.top - 220; // Flip to top if no space below

                setPosition({ top, left });
            } else {
                // Fallback if element not found
                setTargetRect(null);
            }
        }, 500); // Slightly longer delay for view transition + action

        return () => {
            clearTimeout(timer);
            clearTimeout(actionTimer);
        };
    }, [currentStep, isOpen, setCurrentView]);

    if (!isOpen) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    return createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* NO BACKDROP BLUR as requested, just a transparent overlay to catch clicks if needed, but we want pointer-events-none mostly */}
            {/* Actually we probably want to block interaction with the rest of the app while tour is active? 
               User said "highlighting box should not blur out". 
               Let's remove the blur but keep a slight dim to focus attention, or just completely transparent if they want full visibility.
               "not blur out" implies visibility. Let's use a very subtle dim.
            */}
            <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 pointer-events-auto" />

            {/* Highlight Target Border */}
            {targetRect && (
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

            {/* Tooltip Card */}
            <div
                className="absolute pointer-events-auto transition-all duration-500 ease-in-out"
                style={{
                    top: targetRect ? position.top : '50%',
                    left: targetRect ? position.left : '50%',
                    transform: targetRect ? 'none' : 'translate(-50%, -50%)'
                }}
            >
                <div className="w-80 glass-panel bg-white/80 backdrop-blur-xl border border-white/40 p-6 rounded-2xl shadow-2xl text-gray-800 relative overflow-hidden">
                    {/* Decorative gradient blob */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                Step {currentStep + 1}/{steps.length}
                            </span>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-gray-800">{step.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            {step.content}
                        </p>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
                            >
                                Skip Tour
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                    disabled={currentStep === 0}
                                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() => {
                                        if (isLast) {
                                            onClose();
                                        } else {
                                            setCurrentStep(currentStep + 1);
                                        }
                                    }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
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
