import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/test/HomePage.tsx";
import MagicLinkLogin from "./pages/login/MagicLinkLogin.tsx";
import RoleDashboardView from "./pages/RoleDashboardView";
import Layout from "./components/Layout/Layout";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<MagicLinkLogin />} />
      <Route path="/" element={<HomePage />} />
      <Route element={<Layout />}>
        <Route path="/dashboard/:role" element={<RoleDashboardView />} />
      </Route>
    </Routes>
  );
};

export default App;
