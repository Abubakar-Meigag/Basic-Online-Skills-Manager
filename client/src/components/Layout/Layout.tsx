import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

const Layout = () => {
  return (
    <div className="layout flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* The child dashboard (Staff, Commercial, or Outreach) renders here */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
