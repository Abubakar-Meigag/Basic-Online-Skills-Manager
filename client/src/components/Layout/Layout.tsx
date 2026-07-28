import type { ReactNode } from "react";
import Sidebar from "../Sidebar/Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout flex">
      <Sidebar />
      {children}
    </div>
  );
};

export default Layout;
