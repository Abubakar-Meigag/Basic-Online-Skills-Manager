import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MagicLinkLogin from "./components/MagicLinkLogin";
import RoleDashboardView from "./views/RoleDashboardView";
import Layout from "./components/Layout/Layout";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<MagicLinkLogin />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard/:role" element={<RoleDashboardView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
