import { parseISO, format } from "date-fns";
import tableHeaderStyle from "../../lib/constants/tableHeaderStyle";
import type { Course } from "../../data/dataType";

const CYFStaffTable = ({ courses }: { courses: Course[] }) => {
  return (
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
              <td className="py-4 text-sm text-slate-600 px-4">
                {course.commercial_org}
              </td>
              <td className="py-4 text-sm text-slate-600 px-4">
                {course.outreach_org}
              </td>
              <td className="py-4 text-sm text-slate-600 px-4">
                {course.city}
              </td>
              <td className="py-4 text-sm text-slate-600 px-4">3 Weeks</td>
              <td className="py-4 text-sm text-slate-600 px-4">
                {/* This formats the date from ISO string to local format*/}
                {format(parseISO(course.deadline), "dd/MM/yyyy")}
              </td>
              <td>{course.status}</td>
              <td className="py-4 text-sm px-4">
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  View Details
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default CYFStaffTable;
