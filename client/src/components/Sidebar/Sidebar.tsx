const Sidebar = () => {
  const userType: string = "";

  return (
    <div className="sidebar">
      <img src="/src/assets/CYF-logo.png" width="256" height="256" />

      {userType === "commercial" && (
        <nav>
          <ul>
            <li>Courses</li>
            <li>Request New Course</li>
          </ul>
        </nav>
      )}
      {userType === "outreach" && (
        <nav>
          <ul>
            <li>Find Opportunities</li>
            <li>Requested Courses</li>
          </ul>
        </nav>
      )}
      {userType === "cyf-staff" && (
        <nav>
          <ul>
            <li>Request Pipeline</li>
            <li>Manage Partners</li>
            <li>Audit Log</li>
          </ul>
        </nav>
      )}
      <button type="button">Logout</button>
    </div>
  );
};

export default Sidebar;
