import { useEffect, useState } from "react";
import { differenceInWeeks } from "date-fns";
import statusLabel from "../../utils/statusLabel";
import { courses as dbCourses } from "../../data/db";
import type { Course } from "../../data/dataType";

const tableHeaderStyle =
  "py-5 text-[#333333] text-xs font-bold uppercase tracking-wider";

const courseLengthInWeeks = (startDate: string, endDate: string) =>
  differenceInWeeks(new Date(endDate), new Date(startDate));

const OutreachDashboard = ({
  partnerName = "DWP",
}: {
  partnerName?: string;
}) => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const request_pending = dbCourses.filter(
      (course) => course.status === "request_pending",
    );
    const request_open = dbCourses.filter(
      (course) => course.status === "request_open",
    );
    const request_claimed = dbCourses.filter(
      (course) => course.status === "request_claimed",
    );
    const request_confirmed = dbCourses.filter(
      (course) => course.status === "request_confirmed",
    );
    const course_running = dbCourses.filter(
      (course) => course.status === "course_running",
    );
    const course_completed = dbCourses.filter(
      (course) => course.status === "course_completed",
    );
    const request_cancelled = dbCourses.filter(
      (course) => course.status === "request_cancelled",
    );

    // Sorts courses by label
    const courseByStatus = [
      ...request_pending,
      ...request_open,
      ...request_claimed,
      ...request_confirmed,
      ...course_completed,
      ...course_running,
      ...request_cancelled,
    ];

    setCourses(
      courseByStatus.filter(
        (course: Course) => course.account_name === partnerName,
      ),
    );
  }, [partnerName]);

  return (
    <div className="find-opportunities">
      <div className="discovery-header flex justify-between mt-10 mb-20 mx-12">
        <h2 className="text-xl font-bold text-[#333333]">
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
            <th className={`${tableHeaderStyle} px-4`}>Status</th>
            <th className={`${tableHeaderStyle} px-4`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const { statusStyle, statusText } = statusLabel(course.status);

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
                <td className="py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyle}`}
                  >
                    {statusText}
                  </span>
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
