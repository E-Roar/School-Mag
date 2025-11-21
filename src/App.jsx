import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PublicScene } from "./routes/PublicScene";
import { AdminPage } from "./routes/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicScene />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
