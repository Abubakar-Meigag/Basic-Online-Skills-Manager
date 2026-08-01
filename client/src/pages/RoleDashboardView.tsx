import { useParams } from "react-router-dom";
import CYFStaffDashboard from "../components/Dashboard/CYFStaffDashboard";
import CommercialPartnerDashboard from "../components/Dashboard/CommercialPartnerDashboard";
import OutreachPartnerDashboard from "../components/Dashboard/OutreachPartnerDashboard";

export default function RoleDashboardView() {
  const { role } = useParams();

  switch (role) {
    case "cyf-staff":
      return <CYFStaffDashboard />;
    case "commercial-partner":
      return <CommercialPartnerDashboard />;
    case "outreach-partner":
      return <OutreachPartnerDashboard />;
  }
}
