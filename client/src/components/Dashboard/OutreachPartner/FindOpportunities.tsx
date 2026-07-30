const FindOpportunities = () => {
  return (
    <div className="find-opportunities ml-64 p-6 min-h-screen">
      <div className="discovery-header flex justify-between">
        <p>Available Opportunities</p>
        <select name="filter by city" id="filter-by-city">
          <option value="select-a-city">Select a city...</option>
          {/* This should be filled dynamically based on the data available */}
          <option value="london">London</option>
          <option value="manchester">Manchester</option>
        </select>
      </div>
    </div>
  );
};

export default FindOpportunities;
