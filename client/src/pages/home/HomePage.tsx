import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { type User, OrganizationType } from "../../data/dataType";

export default function HomePage() {
  const navigate = useNavigate();

  // This is our "Fake" user for now.
  // You can change "commercial" to "outreach" to test the different doors!
  const mockUser: User = {
    id: "user-001",
    email: "test@codeyourfuture.io",
    organisation_id: null,
    is_active: true,
    created_at: "2026-01-01",
    last_login_at: null,
    is_logged_in: false,
    organization_type: OrganizationType.COMMERCIAL_PARTNER,
  };

  useEffect(() => {
    if (!mockUser.is_logged_in) {
      navigate("/login");
    } else if (
      mockUser.organization_type === OrganizationType.COMMERCIAL_PARTNER
    ) {
      navigate("/commercial-partner/requested-courses");
    } else if (
      mockUser.organization_type === OrganizationType.OUTREACH_PARTNER
    ) {
      navigate("/outreach-partner/find-opportunities");
    } else if (mockUser.organization_type === OrganizationType.CYF_STAFF) {
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
