import { useEffect, useState } from "react";
import { courses as dbCourses } from "../../data/db";
import type { Course } from "../../data/dataType";

const tableHeaderStyle =
  "py-5 text-[#333333] text-xs font-bold uppercase tracking-wider";

const OutreachDashboard = (partnerName: string = "DWP") => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setCourses(
      dbCourses.filter((course: Course) => course.account_name === "DWP"),
    );
  }, []);

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
      <table className="find-opportunities-table w-full text-left border border-[#E3E3E3] border-collapse">
        <thead>
          <tr className="bg-[#F3F3F3]">
            <th className={`${tableHeaderStyle} pl-10`}>ID</th>
            <th className={`${tableHeaderStyle} px-4`}>Commercial Partner</th>
            <th className={`${tableHeaderStyle} px-4`}>Location</th>
            <th className={`${tableHeaderStyle} px-4`}>Trainee Target</th>
            <th className={`${tableHeaderStyle} px-4`}>Duration</th>
            <th className={`${tableHeaderStyle} px-4`}>Deadline</th>
            <th className={`${tableHeaderStyle} px-4`}>Status</th>
            <th className={`${tableHeaderStyle} px-4`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => {
            return (
              <tr key={index}>
                <td>{course.id}</td>
                <td>{course.commercial_org_id}</td>
                <td>{course.city}</td>
                <td>{course.trainee_target}</td>
                <td>{course.end_date - course.start_date}</td>
                <td>{course.deadline}</td>
                <td>{course.status}</td>
                <td>
                  <a href="">View Opportunity Details</a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OutreachDashboard;
