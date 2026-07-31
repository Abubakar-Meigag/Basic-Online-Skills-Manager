import { Navigate, useParams } from "react-router-dom";
import CYFStaffDashboard from "./CYFStaffDashboard";
import CommercialPartnerDashboard from "./CommercialPartnerDashboard";
import OutreachPartnerDashboard from "./OutreachPartnerDashboard";

export default function RoleDashboardView() {
  const { role } = useParams();

  switch (role) {
    case "cyf-staff":
      return <CYFStaffDashboard />;
    case "commercial-partner":
      return <CommercialPartnerDashboard />;
    case "outreach-partner":
      return <OutreachPartnerDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
}
