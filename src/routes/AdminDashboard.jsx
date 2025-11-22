import { Sidebar } from "../components/admin/Sidebar";
import { Editor } from "../components/admin/Editor";

export const AdminDashboard = () => {
    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <Sidebar />
            <Editor />
        </div>
    );
};
