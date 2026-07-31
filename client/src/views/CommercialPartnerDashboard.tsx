import { Link } from 'react-router-dom';

export default function CommercialPartnerDashboard() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Welcome Commercial Partner</h1>
      <p>You are logged in as a Commercial Partner.</p>
      <p>
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  );
}
