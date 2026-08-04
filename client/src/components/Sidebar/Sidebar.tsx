import { NavLink } from "react-router";
import CYFLogo from "../../assets/CYF-logo.png";
import { users } from "../../data/db";
import "./Sidebar.css";

const Sidebar = ({ userType = "commercial" }) => {
  // Change userType prop above to see view for a different user. Accepts strings "commercial", "outreach" & "cyf-staff"

  const firstUser = users[0];

  // Use their email, or a backup if they don't exist
  const userEmail = firstUser ? firstUser.email : "user@email.com";
  const userInitial = userEmail ? userEmail[0].toUpperCase() : "U";

  return (
    <div className="sidebar flex flex-col h-screen p-5 shrink-0 sticky top-0 self-start">
      <img className="mb-5" src={CYFLogo} width="256" height="256" />

      <nav>
        <ul>
          {userType === "commercial" && (
            <>
              <NavLink to="/dashboard/commercial-partner/requested-courses">
                <li>Requested Courses</li>
              </NavLink>
              <NavLink to="/dashboard/commercial-partner/request-new-course">
                <li>Request New Course</li>
              </NavLink>
            </>
          )}
          {userType === "outreach" && (
            <>
              <NavLink to="/dashboard/outreach-partner/find-opportunities">
                <li>Find Opportunities</li>
              </NavLink>
              <NavLink to="/dashboard/outreach-partner/hosted-courses">
                <li>My Hosted Courses</li>
              </NavLink>
            </>
          )}
          {userType === "cyf-staff" && (
            <>
              <NavLink to="/dashboard/cyf-staff/request-pipeline">
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
        </ul>
      </nav>

      <div className="mt-auto pt-5 border-t border-[#E3E3E3]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-sm font-semibold text-red-700">
            {userInitial}
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold">{userEmail}</span>
            <NavLink to="/login" className="text-xs text-gray-500">
              Logout
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
