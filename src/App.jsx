import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BookDataProvider } from "./context/BookDataContext";
import { NotificationProvider } from "./context/NotificationContext";
import { FullPageLoader } from "./components/CircularLoader";
import { NotificationCenter } from "./components/NotificationCenter";

// Lazy Load Routes for Performance
const LandingPage = lazy(() => import("./routes/LandingPage").then(module => ({ default: module.LandingPage })));
const PublicScene = lazy(() => import("./routes/PublicScene").then(module => ({ default: module.PublicScene })));
const AdminPage = lazy(() => import("./routes/AdminPage").then(module => ({ default: module.AdminPage })));
const IssueViewer = lazy(() => import("./routes/IssueViewer").then(module => ({ default: module.IssueViewer })));

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            {/* New Landing Page */}
            <Route path="/" element={
              <BookDataProvider isAdminMode={false}>
                <LandingPage />
              </BookDataProvider>
            } />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Issue Viewer (3D) */}
            <Route path="/view/:issueId" element={<IssueViewer />} />

            {/* Old 3D View (temporary - keep for reference) */}
            <Route path="/old" element={<PublicScene />} />
          </Routes>
        </Suspense>

        {/* Global Notification Center */}
        <NotificationCenter />
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
