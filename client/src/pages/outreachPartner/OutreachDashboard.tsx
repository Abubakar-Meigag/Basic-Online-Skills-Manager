import { useCallback, useEffect, useState } from "react";
import { parseISO, format } from "date-fns";
import tableHeaderStyle from "../../lib/constants/tableHeaderStyle";
import type { Course } from "../../data/dataType";
import { api } from "../../auth/authApi";
import ClaimOpportunity from "./ClaimOpportunity";

const OutreachDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const getCourses = useCallback(async () => {
    try {
      const res = await api.get("/opportunities");
      const data = res.data;
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

  // Return to the board (cancel).
  const handleBack = () => {
    setSelectedCourse(null);
  };

  // After a successful claim leave the form and refresh the list so the
  // claimed course drops off the open-opportunities board.
  const handleClaimed = () => {
    setSelectedCourse(null);
    getCourses();
  };

  // Show the claim form for the selected course.
  if (selectedCourse) {
    return (
      <ClaimOpportunity
        course={selectedCourse}
        onBack={handleBack}
        onClaimed={handleClaimed}
      />
    );
  }

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
                <td className="py-4 text-sm text-slate-600 px-4">
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
                  {format(parseISO(course.deadline), "dd/MM/yyyy")}
                </td>
                <td className="py-4 text-sm px-4">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
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
