import { Route, Routes, Navigate } from "react-router-dom";
// What: These are the building blocks of the "React Router" library.
// Why: Routes acts as the container, Route defines a single path, and Navigate is a "teleporter" to send users from one path to another automatically.
import HomePage from "./pages/home/HomePage.tsx";
import MagicLinkLogin from "./pages/login/MagicLinkLogin.tsx";
import Layout from "./components/Layout/Layout";
import VerifyMagicLink from "./pages/login/VerifyMagicLink.tsx";
import { OrganizationType } from "./data/dataType";
import { ProtectedRoute } from "./components/ProtectedRoute";
// What: OrganizationType is a list of roles (Staff, Partner, etc.). ProtectedRoute is a custom "Security Guard" component.
// Why: We need these to make sure a "Partner" can't accidentally wander into the "Staff" office.
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
  ManageUsersPage,
  ManagePartnersPage,
  AuditLogPage,
} from "./pages/cyfstaff/index.ts";
// What: These are the actual pages your team built.
// Why: App.tsx needs to import them so it can put them on the screen when the URL matches.
// (Notice the index.ts—this is the "Barrel Export" we talked about that keeps the list clean).

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<MagicLinkLogin />} />
      <Route path="/verify" element={<VerifyMagicLink />} />
      <Route path="/" element={<HomePage />} />

      {/* What: These are routes that don't have a "Guard."
      Why: You can't put a guard on the front door! Alice needs to be able to see the Home page and the Login page before she has her "Security Badge" (JWT). */}

      {/* Protected Layout Section */}
      <Route element={<Layout />}>
        {/* What: This is a Layout Wrapper. It doesn't have a path of its own.
        Why: Every page inside this route will automatically show the Sidebar and the common page structure. 
        This prevents the Sidebar from "flickering" or disappearing when Alice moves between her dashboard and her settings. */}
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
          // What: This route has no path, but it has the ProtectedRoute "Guard."
          // Why: This Guard stands in front of all the routes inside it. It checks Alice's "Badge" (her JWT role). If the badge doesn't say CYF_STAFF, the Guard blocks her.
        >
          <Route path="/cyf-staff">
            <Route index element={<Navigate to="request-pipeline" replace />} />
            <Route path="request-pipeline" element={<CYFStaffDashboard />} />
            <Route path="manage-users" element={<ManageUsersPage />} />
            <Route path="manage-partners" element={<ManagePartnersPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            {/* path="/cyf-staff": This is the main hallway for staff.
            index + Navigate: If Alice types just /cyf-staff, this "teleports" her automatically to /cyf-staff/request-pipeline.
            Why: We don't want Alice to see a blank page; we want her to see the most important info (the Pipeline) immediately.
            path="manage-users": This is a "room" inside the staff hallway. The full URL becomes /cyf-staff/manage-users.
            Why: By nesting them, we keep the URLs organized and logical. */}
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;

// "Tracing" Summary
// If Alice types https://bosm.../cyf-staff/manage-users:
// App.tsx sees the URL.
// It matches the Layout route (so the Sidebar appears).
// It hits the ProtectedRoute for Staff. The Guard checks Alice's badge.
// If she is Staff, it enters the /cyf-staff hallway.
// It finds the manage-users room and puts the ManageUsersPage component on the screen.
