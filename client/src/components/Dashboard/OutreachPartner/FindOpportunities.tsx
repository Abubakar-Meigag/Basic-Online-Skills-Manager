const FindOpportunities = () => {
  return (
    <div className="find-opportunities">
      <div className="discovery-header flex justify-between mt-10 mb-20 mx-12">
        <p>Available Opportunities</p>
        <select name="filter by city" id="filter-by-city">
          <option value="select-a-city">Select a city...</option>
          {/* This should be filled dynamically based on the data available */}
          <option value="london">London</option>
          <option value="manchester">Manchester</option>
        </select>
      </div>
      <table className="find-opportunities-table table-auto w-full text-left">
        <thead>
          <tr>
            <th>ID</th>
            <th>Commercial Partner</th>
            <th>Location</th>
            <th>Trainee Target</th>
            <th>Duration</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>REQ-0051</td>
            <td>Capgemini</td>
            <td>London</td>
            <td>24</td>
            <td>3 weeks</td>
            <td>15 Aug 2026</td>
            <td>Open</td>
            <td>View Opportunity Details</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FindOpportunities;
