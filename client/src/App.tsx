import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/test/HomePage.tsx";
import MagicLinkLogin from "./pages/login/MagicLinkLogin.tsx";
import Layout from "./components/Layout/Layout";
import RequestedCoursesPage from "./pages/commercialPartner/RequestedCoursesPage.tsx";
import RequestNewCoursePage from "./pages/commercialPartner/RequestNewCoursePage.tsx";
import OutreachPartnerDashboard from "./pages/outreachpartner/OutreachDashboard.tsx";
import CYFStaffDashboard from "./pages/cyfstaff/CYFStaffDashboard.tsx";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<MagicLinkLogin />} />
      <Route path="/" element={<HomePage />} />
      <Route element={<Layout />}>
        <Route path="/commercial-partner">
          <Route path="requested-courses" element={<RequestedCoursesPage />} />
          <Route path="request-new-course" element={<RequestNewCoursePage />} />
        </Route>
        <Route path="/outreach-partner">
          <Route
            path="find-opportunities"
            element={<OutreachPartnerDashboard />}
          />
        </Route>
        <Route path="/cyf-staff">
          <Route path="request-pipeline" element={<CYFStaffDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
