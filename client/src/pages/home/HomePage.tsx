import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
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
