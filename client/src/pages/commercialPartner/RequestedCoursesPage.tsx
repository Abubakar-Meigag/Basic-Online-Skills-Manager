import { useState, useEffect, useCallback } from "react";
import PageHeader from "../../components/PageHeader";
import type { Course } from "../../data/dataType.ts";
import { parseISO, format } from "date-fns";
import tableHeaderStyle from "../../lib/constants/tableHeaderStyle";
import statusLabel from "../../utils/statusLabel.ts";
import { api } from "../../auth/authApi";

const RequestedCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  const getCourses = useCallback(async () => {
    try {
      const res = await api.get("/commercial-dashboard");
      const data = res.data;
      setCourses(data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCourses();
  }, [getCourses]);

  return (
    <section className="p-6">
      <div className="sticky top-0 z-20 bg-white pt-6">
        <PageHeader
          title="Requested Courses"
          description="All course requests submitted by your organisation."
        />
      </div>

      <div className="max-h-[80vh] overflow-y-auto border border-[#E3E3E3]">
        <table className="find-opportunities-table w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#F3F3F3]">
              <th className={`${tableHeaderStyle} pl-10`}>ID</th>
              <th className={`${tableHeaderStyle} px-4`}>Contract Name</th>
              <th className={`${tableHeaderStyle} px-4`}>Location</th>
              <th className={`${tableHeaderStyle} px-4`}>Trainee Target</th>
              <th className={`${tableHeaderStyle} px-4`}>Deadline</th>
              <th className={`${tableHeaderStyle} px-4`}>Status</th>
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
                  <td className="py-4 text-sm text-center text-slate-500 pl-5">
                    {course.id.slice(-5)}
                  </td>
                  <td className="py-4 text-sm text-center text-slate-600 px-4">
                    {course.contract_name}
                  </td>
                  <td className="py-4 text-sm text-center text-slate-600 px-4">
                    {course.city}
                  </td>
                  <td className="py-4 text-sm text-center text-slate-600 px-14">
                    {course.trainee_target}
                  </td>
                  <td className="py-4 text-sm text-center text-slate-600 px-4">
                    {/* This formats the date from ISO string to local format*/}
                    {format(parseISO(course.deadline), "dd/MM/yyyy")}
                  </td>
                  <td className="py-4 text-sm text-center text-slate-600 px-4">
                    <span
                      className={`inline-flex rounded-sm justify-center px-2 py-1 text-xs font-semibold ${statusStyle}`}
                    >
                      {statusText}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RequestedCoursesPage;
