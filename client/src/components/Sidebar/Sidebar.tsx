import { NavLink } from "react-router";
import CYFLogo from "../../assets/CYF-logo.png";
import { users } from "../../data/db";
import { navLinks } from "../../lib/constants/navLinks";
import { OrganizationType } from "../../data/dataType";
import "./Sidebar.css";

const rolePathMap: Record<OrganizationType, string> = {
  [OrganizationType.COMMERCIAL_PARTNER]: "commercial-partner",
  [OrganizationType.OUTREACH_PARTNER]: "outreach-partner",
  [OrganizationType.CYF_STAFF]: "cyf-staff",
};

const Sidebar = ({
  userType = OrganizationType.COMMERCIAL_PARTNER,
}: {
  userType?: OrganizationType;
}) => {
  // Change userType prop above to see view for a different user.

  const urlRoleName = rolePathMap[userType];

  const firstUser = users[0];

  // Use their email, or a backup if they don't exist
  const userEmail = firstUser ? firstUser.email : "user@email.com";
  const userInitial = userEmail ? userEmail[0].toUpperCase() : "U";

  return (
    <div className="sidebar flex flex-col h-screen shrink-0 sticky top-0 self-start border-r border-[#E3E3E3]">
      <div className="p-5">
        <img className="mb-5" src={CYFLogo} width="120" height="120" />
      </div>

      <nav className="px-5">
        <ul>
          {navLinks
            .filter((link) => link.path.startsWith(`/${urlRoleName}/`))
            .map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center p-3 bg-red-50 text-[#EE2A24] border-l-4 border-[#EE2A24] rounded-r-lg"
                      : "flex items-center p-3 text-gray-700"
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>

      <div className="mt-auto p-5 border-t border-[#E3E3E3]">
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
