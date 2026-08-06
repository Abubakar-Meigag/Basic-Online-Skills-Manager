import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Organization_Types, type OrganizationType } from "../../data/dataType";

export default function HomePage() {
  const navigate = useNavigate();

  // We define the "Shape" of a user
  interface User {
    isLoggedIn: boolean;
    orgType: OrganizationType; // This forces the role to match our allowed list!
  }

  // This is our "Fake" user for now.
  // You can change "commercial" to "outreach" to test the different doors!
  const mockUser: User = {
    isLoggedIn: true,
    orgType: Organization_Types.COMMERCIAL,
  };

  useEffect(() => {
    if (!mockUser.isLoggedIn) {
      navigate("/login");
    } else if (mockUser.orgType === Organization_Types.COMMERCIAL) {
      navigate("/commercial-partner/requested-courses");
    } else if (mockUser.orgType === Organization_Types.OUTREACH) {
      navigate("/outreach-partner/find-opportunities");
    } else if (mockUser.orgType === Organization_Types.CYF_STAFF) {
      navigate("/cyf-staff/request-pipeline");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4">
      {/* This div will be the spinner */}
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600"></div>

      {/* It's still good to have a small text label for accessibility */}
      <p className="text-sm text-gray-500">Loading your dashboard...</p>
    </div>
  );
}
