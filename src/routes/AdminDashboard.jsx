import { useState } from "react";
import { Sidebar } from "../components/admin/Sidebar";
import { Editor } from "../components/admin/Editor";
import { TopNav } from "../components/admin/TopNav";
import { DashboardOverview } from "../components/admin/DashboardOverview";
import { SettingsPanel } from "../components/admin/SettingsPanel";

export const AdminDashboard = () => {
    const [currentView, setCurrentView] = useState('dashboard');

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
        </div>
    );
};
