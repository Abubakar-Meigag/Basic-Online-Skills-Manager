import { Navigate, Outlet } from "react-router-dom";
// What it does: Imports two structural routing components from the React Router library

// Why we need it:
// Navigate: This is our "Teleportation Device"
// It is a declarative component that, when returned by React, instantly forces the browser to change URLs and redirect the user to a different page

// Outlet: This is our "Doorway"
// In React Router, you can nest routes inside each other. The Outlet component is a placeholder; it tells React, "If the user passes all security checks,
// render the child component (the actual page they wanted) right here"

export const ProtectedRoute = ({
  allowedRoles,
}: {
  allowedRoles: string[];
}) => {
  // What it does: Declares a reusable React component named ProtectedRoute
  // It uses TypeScript to enforce that whoever calls this component must pass a prop called allowedRoles, which is an array of strings

  // Why we need it: This is the security guard’s "Guest List"
  // Instead of writing a separate route guard for every single dashboard, we write one smart guard

  // For example, in App.tsx, we lock down the Staff Dashboard by declaring: <Route element={<ProtectedRoute allowedRoles={["cyf_staff"]} />}>

  // For the Commercial dashboard, we write:  <Route element={<ProtectedRoute allowedRoles={["commercial"]} />}>

  const userString = localStorage.getItem("user");
  // What it does: Reaches into the browser's persistent storage (localStorage) and requests the data stored under the key "user"

  // Why we need it: This is where the application stores the user's local identity
  // When Alice successfully logs in via her magic link, the frontend captures her profile object (containing her email and organization type)
  // and locks it inside local storage so she doesn't have to log in again every time she refreshes her tab.

  const user = userString ? JSON.parse(userString) : null;
  // What it does: Evaluates if userString exists
  // If it does, it runs JSON.parse to convert that raw string back into a structural JavaScript Object
  // If the string is empty (meaning no one is logged in), it defaults the variable user to null

  // Why we need it: The browser's localStorage is primitive—it can only save plain text
  // Because we saved her profile as a stringified JSON string, we cannot read nested properties like user.orgType directly
  // We must translate it back into an object so the code can read her organization type

  // Not logged in? Go to login
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role? Go to root (HomePage.tsx will then send them to their own dashboard)
  if (!allowedRoles.includes(user.orgType)) {
    return <Navigate to="/" replace />;
  }

  // Authorized? Show the content
  return <Outlet />;
};
