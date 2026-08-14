import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({
  allowedRoles,
}: {
  allowedRoles: string[];
}) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Not logged in? Go to login
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role? Go to root (HomePage.tsx will then send them to their own dashboard)
  if (!allowedRoles.includes(user.orgType)) {
    return <Navigate to="/" replace />;
  }

  // Authorized? Show the content
  return <Outlet />;
};
