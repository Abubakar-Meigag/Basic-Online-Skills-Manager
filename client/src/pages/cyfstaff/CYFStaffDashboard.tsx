import { Link } from "react-router-dom";

export default function CYFStaffDashboard() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>Welcome CYF Staff</h1>
      <p>You are logged in as a CYF Staff member.</p>
      <p>
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  );
}
