import { Navigate, useParams } from "react-router-dom";
import CYFStaffDashboard from "./CYFStaffDashboard";
import CommercialPartnerDashboard from "./CommercialPartnerDashboard";
import OutreachPartnerDashboard from "./OutreachPartnerDashboard";

export default function RoleDashboardView() {
  const { role } = useParams();

  switch (role) {
    case "cyf_staff":
      return <CYFStaffDashboard />;
    case "commercial_partner":
      return <CommercialPartnerDashboard />;
    case "outreach_partner":
      return <OutreachPartnerDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
}
