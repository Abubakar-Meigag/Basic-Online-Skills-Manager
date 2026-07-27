import { NavLink } from "react-router";
import "./Sidebar.css";

const Sidebar = () => {
  const userType: string = "commercial";
  //  /dashboard/commercial-partner

  return (
    <div className="sidebar p-5 shrink-0 sticky top-0 self-start h-screen">
      <img
        className="mb-5"
        src="/src/assets/CYF-logo.png"
        width="256"
        height="256"
      />

      <nav>
        <ul>
          {userType === "commercial" && (
            <>
              <NavLink to="/dashboard/commercial-partner/courses">
                <li>Courses</li>
              </NavLink>
              <NavLink to="/dashboard/commercial-partner/new-course">
                <li>Request New Course</li>
              </NavLink>
            </>
          )}
          {userType === "outreach" && (
            <>
              <NavLink to="/dashboard/outreach-partner/find-opportunities">
                <li>Find Opportunities</li>
              </NavLink>
              <NavLink to="/dashboard/outreach-partner/requested-courses">
                <li>Requested Courses</li>
              </NavLink>
            </>
          )}
          {userType === "cyf-staff" && (
            <>
              <NavLink to="/dashboard/cyf-staff/requestd-pipelines">
                <li>Request Pipeline</li>
              </NavLink>
              <NavLink to="/dashboard/cyf-staff/manage-partners">
                <li>Manage Partners</li>
              </NavLink>
              <NavLink to="/dashboard/cyf-staff/audit-log">
                <li>Audit Log</li>
              </NavLink>
            </>
          )}
          <NavLink to="/login">
            <li>Logout</li>
          </NavLink>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
