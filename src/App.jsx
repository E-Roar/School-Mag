import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "./routes/LandingPage";
import { PublicScene } from "./routes/PublicScene";
import { AdminPage } from "./routes/AdminPage";
import { IssueViewer } from "./routes/IssueViewer";
import { BookDataProvider } from "./context/BookDataContext";

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
