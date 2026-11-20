import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OrganizationType } from "../../data/dataType";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user) {
        navigate("/login");
        return;
      }

      switch (user.orgType) {
        case OrganizationType.CYF_STAFF:
          navigate("/cyf-staff/request-pipeline");
          break;
        case OrganizationType.COMMERCIAL_PARTNER:
          navigate("/commercial-partner/requested-courses");
          break;
        case OrganizationType.OUTREACH_PARTNER:
          navigate("/outreach-partner/find-opportunities");
          break;
        default:
          navigate("/login");
          break;
      }
    } catch (error) {
      console.error("Error parsing user data or navigating:", error);
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4">
      {/* This div will be the spinner */}
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600"></div>

      {/* small text label for accessibility */}
      <p className="text-sm text-gray-500">Loading your dashboard...</p>
    </div>
  );
}
