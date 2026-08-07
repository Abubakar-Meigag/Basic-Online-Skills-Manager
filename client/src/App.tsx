import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage.tsx";
import MagicLinkLogin from "./pages/login/MagicLinkLogin.tsx";
import Layout from "./components/Layout/Layout";
import {
  RequestedCoursesPage,
  RequestNewCoursePage,
} from "./pages/commercialPartner/index.ts";
import {
  OutreachPartnerDashboard,
  HostedCoursesPage,
} from "./pages/outreachpartner/index.ts";
import {
  CYFStaffDashboard,
  ManagePartnersPage,
  AuditLogPage,
} from "./pages/cyfstaff/index.ts";

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
          <Route path="hosted-courses" element={<HostedCoursesPage />} />
        </Route>
        <Route path="/cyf-staff">
          <Route path="request-pipeline" element={<CYFStaffDashboard />} />
          <Route path="manage-partners" element={<ManagePartnersPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
