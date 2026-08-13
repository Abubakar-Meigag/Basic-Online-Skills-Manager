import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { OrganizationType } from "../../data/dataType";

// Blueprint of our real JWT
interface DecodedToken {
  orgType: string;
  exp: number;
}

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // 1. Decode the REAL token from the server
      const decoded = jwtDecode<DecodedToken>(token);

      // 2. Check if expired
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem("sessionToken");
        navigate("/login");
        return;
      }

      // 3. Redirect based on real data
      const role = decoded.orgType;

      if (role === OrganizationType.CYF_STAFF) {
        navigate("/cyf-staff/request-pipeline");
      } else if (role === OrganizationType.COMMERCIAL_PARTNER) {
        navigate("/commercial-partner/requested-courses");
      } else if (role === OrganizationType.OUTREACH_PARTNER) {
        navigate("/outreach-partner/find-opportunities");
      } else {
        navigate("/login");
      }
    } catch (error) {
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
