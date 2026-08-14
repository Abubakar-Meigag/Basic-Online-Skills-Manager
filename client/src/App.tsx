import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage.tsx";
import MagicLinkLogin from "./pages/login/MagicLinkLogin.tsx";
import Layout from "./components/Layout/Layout";
import VerifyMagicLink from "./pages/login/VerifyMagicLink.tsx";
import { Navigate } from "react-router-dom";
import { OrganizationType } from "./data/dataType";
import { ProtectedRoute } from "./components/ProtectedRoute";
import {
  RequestedCoursesPage,
  RequestNewCoursePage,
} from "./pages/commercialPartner/index.ts";
import {
  OutreachPartnerDashboard,
  HostedCoursesPage,
} from "./pages/outreachPartner/index.ts";
import {
  CYFStaffDashboard,
  ManagePartnersPage,
  AuditLogPage,
} from "./pages/cyfstaff/index.ts";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<MagicLinkLogin />} />
      <Route path="/verify" element={<VerifyMagicLink />} />
      <Route path="/" element={<HomePage />} />

      {/* Protected Layout Section */}
      <Route element={<Layout />}>
        {/* Strictly for only Commercial Partners */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[OrganizationType.COMMERCIAL_PARTNER]}
            />
          }
        >
          <Route path="/commercial-partner">
            <Route
              index
              element={<Navigate to="requested-courses" replace />}
            />
            <Route
              path="requested-courses"
              element={<RequestedCoursesPage />}
            />
            <Route
              path="request-new-course"
              element={<RequestNewCoursePage />}
            />
          </Route>
        </Route>

        {/* Strictly for only Outreach Partners */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[OrganizationType.OUTREACH_PARTNER]}
            />
          }
        >
          <Route path="/outreach-partner">
            <Route
              index
              element={<Navigate to="find-opportunities" replace />}
            />
            <Route
              path="find-opportunities"
              element={<OutreachPartnerDashboard />}
            />
            <Route path="hosted-courses" element={<HostedCoursesPage />} />
          </Route>
        </Route>

        {/* DOOR 3: Only for CYF Staff */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[OrganizationType.CYF_STAFF]} />
          }
        >
          <Route path="/cyf-staff">
            <Route index element={<Navigate to="request-pipeline" replace />} />
            <Route path="request-pipeline" element={<CYFStaffDashboard />} />
            <Route path="manage-partners" element={<ManagePartnersPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
