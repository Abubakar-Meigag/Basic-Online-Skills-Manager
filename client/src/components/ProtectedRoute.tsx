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
  // What it does: Checks if our user variable is a falsy value e.g. null
  // If it is, the component immediately exits and renders a redirection to /login

  // Why we need it: This is our first line of defense
  // If there is no user object in the browser’s locker, the visitor is an unauthenticated guest trying to sneak into a private dashboard
  // The guard kicks them out to the login screen

  // Why the replace prop is vital: By default, navigating to a new page adds a new entry to the browser's history stack.
  // If we didn't use replace, a kicked-out user could click their browser's "Back" arrow and trigger an infinite loop of loading and getting kicked out.
  // replace overwrites their current history entry, ensuring a clean redirect

  // Wrong role? Go to root (HomePage.tsx will then send them to their own dashboard)
  if (!allowedRoles.includes(user.orgType)) {
    return <Navigate to="/" replace />;
    // What it does: This line executes if the user is logged in, but asks: "Is your assigned organization type (user.orgType) on the permitted guest
    // list (allowedRoles) for this specific page?" If her role is not on the list, she is redirected to the home route /

    // Why we need it: This prevents cross-role sneaking
    // Without this line, a Commercial Partner ("commercial") who is successfully logged in could manually type /cyf-staff/manage-users into their
    // address bar and gain access to CYF Staff administrative lists

    // Why we redirect to / instead of an error page: This is a brilliant structural design choice in your app. When a logged-in user gets
    // sent to / (the root route), the root component HomePage.tsx intercepts them, reads their role from their active session token, and automatically
    // redirects them to their own designated dashboard (e.g., directing a Commercial Partner back to /commercial-partner)
  }

  // Authorized? Show the content
  return <Outlet />;
  // What it does: If the execution reaches this line, the user has passed both checkpoints
  // The guard step-aside and renders the <Outlet /> component

  // Why we need it: This opens the door
  // It tells React Router to safely render whatever nested child pages are matched under this route layout
  // For example, if Alice is a verified staff member visiting /cyf-staff/request-pipeline, the Outlet instantly
  // resolves and loads the <CYFStaffDashboard /> page directly onto her screen
};
