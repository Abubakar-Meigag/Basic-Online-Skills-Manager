import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { OrganizationType } from "../../data/dataType";

const Layout = () => {
  const location = useLocation();

  let currentUserType;

  if (location.pathname.startsWith("/commercial-partner")) {
    currentUserType = OrganizationType.COMMERCIAL_PARTNER;
  } else if (location.pathname.startsWith("/outreach-partner")) {
    currentUserType = OrganizationType.OUTREACH_PARTNER;
  } else if (location.pathname.startsWith("/cyf-staff")) {
    currentUserType = OrganizationType.CYF_STAFF;
  }
  return (
    <div className="layout flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
