import { useEffect, useState } from "react";
import { differenceInWeeks } from "date-fns";
import { courses as dbCourses } from "../../data/db";
import type { Course } from "../../data/dataType";

const tableHeaderStyle =
  "py-5 text-[#333333] text-xs font-bold uppercase tracking-wider";

const courseLengthInWeeks = (startDate: string, endDate: string) =>
  differenceInWeeks(new Date(endDate), new Date(startDate));

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
          {courses.map((course) => {
            return (
              <tr
                key={course.id}
                className="border-b border-[#F3F3F3] hover:bg-[#F3F3F3] transition-colors"
              >
                <td className="py-4 text-sm text-slate-500 pl-5">
                  {course.id}
                </td>
                <td className="py-4 text-sm font-bold text-slate-900 px-4">
                  {course.commercial_org_id}
                </td>
                <td className="py-4 text-sm text-slate-600 px-4">
                  {course.city}
                </td>
                <td className="py-4 text-sm text-slate-600 px-14">
                  {course.trainee_target}
                </td>
                <td>
                  {course.start_date && course.end_date
                    ? courseLengthInWeeks(course.start_date, course.end_date)
                    : "N/A"}
                </td>
                <td className="py-4 text-sm text-slate-600 px-4">
                  {course.deadline}
                </td>
                <td className="py-4">{course.status}</td>
                <td className="py-4 text-sm px-4">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </button>
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
