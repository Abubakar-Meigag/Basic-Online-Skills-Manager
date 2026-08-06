import { useCallback, useEffect, useState } from "react";
import { parseISO, format } from "date-fns";
import type { Course } from "../../data/dataType";

const tableHeaderStyle =
  "py-5 text-[#333333] text-xs font-bold uppercase tracking-wider";

const OutreachDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  const getCourses = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bosm-backend.trainees.hosting.cyf.academy/opportunities",
      );
      const data = await res.json();
      const coursesByStatus = data.filter(
        (course: Course) => course.status === "request_open",
      );
      setCourses(coursesByStatus);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  return (
    <div className="find-opportunities">
      <div className="discovery-header flex justify-between mt-10 mb-20 mx-12">
        <h2 className="text-3xl font-bold text-[#333333]">
          Available Opportunities
        </h2>
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
                  {course.id.slice(-5)}
                </td>
                <td className="py-4 text-sm font-bold text-slate-900 px-4">
                  {course.commercial_org}
                </td>
                <td className="py-4 text-sm text-slate-600 px-4">
                  {course.city}
                </td>
                <td className="py-4 text-sm text-slate-600 px-14">
                  {course.trainee_target}
                </td>
                <td className="py-4 text-sm text-slate-600 px-4">3 Weeks</td>
                <td className="py-4 text-sm text-slate-600 px-4">
                  {/* This formats the date from ISO string to local format*/}
                  {format(parseISO(course.deadline), "dd/MM/yyyy")}
                </td>
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
