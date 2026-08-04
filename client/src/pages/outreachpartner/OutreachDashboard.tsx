import { Link } from "react-router-dom";

export default function OutreachPartnerDashboard() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>Welcome Outreach Partner</h1>
      <p>You are logged in as an Outreach Partner.</p>
      <p>
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  );
}
