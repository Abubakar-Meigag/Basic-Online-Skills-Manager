import { useParams } from "react-router-dom";
import CYFStaffDashboard from "./cyfstaff/CYFStaffDashboard.tsx";
import CommercialDashboard from "./commercialPartner/CommercialDashboard.tsx";
import OutreachPartnerDashboard from "./outreachPartner/OutreachDashboard.tsx";

export default function RoleDashboardView() {
  const { role } = useParams();

  switch (role) {
    case "cyf-staff":
      return <CYFStaffDashboard />;
    case "commercial-partner":
      return <CommercialDashboard />;
    case "outreach-partner":
      return <OutreachPartnerDashboard />;
  }
}
