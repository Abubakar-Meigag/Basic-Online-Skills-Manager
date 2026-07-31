import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RoleDashboardView from "./views/RoleDashboardView";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<MagicLinkLogin />} />
      <Route path="/dashboard/:role" element={<RoleDashboardView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
