import { useState, useEffect } from "react";
import { Sidebar } from "../components/admin/Sidebar";
import { Editor } from "../components/admin/Editor";
import { TopNav } from "../components/admin/TopNav";
import { DashboardOverview } from "../components/admin/DashboardOverview";
import { SettingsPanel } from "../components/admin/SettingsPanel";
import { OnboardingTour } from "../components/admin/OnboardingTour";
import { useBookData } from "../context/BookDataContext";

export const AdminDashboard = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const { isDemoMode } = useBookData();
    const [tourOpen, setTourOpen] = useState(false);

    useEffect(() => {
        if (isDemoMode) {
            setTourOpen(true);
        }
    }, [isDemoMode]);

    useEffect(() => {
        const handleStartTour = () => {
            setTourOpen(true);
            setCurrentView('dashboard'); // Reset view when restarting tour
        };

        window.addEventListener('start-tour', handleStartTour);
        return () => window.removeEventListener('start-tour', handleStartTour);
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-[#e0e5ec] overflow-hidden">
            <TopNav currentView={currentView} onViewChange={setCurrentView} />

            <div className="flex flex-1 overflow-hidden relative">
                {currentView === 'dashboard' && <DashboardOverview />}

                {currentView === 'issues' && (
                    <>
                        <Sidebar />
                        <Editor />
                    </>
                )}

                {currentView === 'settings' && <SettingsPanel />}
            </div>

            <OnboardingTour
                isOpen={tourOpen}
                onClose={() => setTourOpen(false)}
                setCurrentView={setCurrentView}
            />
        </div>
    );
};
