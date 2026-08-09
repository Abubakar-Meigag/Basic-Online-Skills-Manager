import { useCallback, useEffect, useState } from "react";
import CYFStaffTable from "../../components/CYFStaffTable/CYFStaffTable";
import courseCountStyle from "../../lib/constants/courseCountStyle.json" with { type: "json" };

const CYFStaffDashboard = () => {
  const [courses, setCourses] = useState<any>();

  const getCourses = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bosm-backend.trainees.hosting.cyf.academy/course-pipeline",
      );
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  console.log(courses);

  return (
    <div className="request-pipeline">
      <div className="mt-10 mb-10 mx-12">
        <h2 className="text-3xl font-bold text-[#333333]">Request Pipeline</h2>
        <p className="text-gray-500">Courses grouped by their current stage</p>
      </div>
      {courses && (
        <div className="courses-count flex justify-between w-4xl ml-12">
          <div className={courseCountStyle.card}>
            <p className={courseCountStyle.status}>Pending Review</p>
            <p className={courseCountStyle.count}>
              {courses.request_pending.length}
            </p>
          </div>
          <div className={courseCountStyle.card}>
            <p className={courseCountStyle.status}>Open</p>
            <p className={courseCountStyle.count}>
              {courses.request_open.length}
            </p>
          </div>
          <div className={courseCountStyle.card}>
            <p className={courseCountStyle.status}>Confirmed</p>
            <p className={courseCountStyle.count}>
              {courses.request_confirmed.length}
            </p>
          </div>
          <div className={courseCountStyle.card}>
            <p className={courseCountStyle.status}>Running</p>
            <p className={courseCountStyle.count}>
              {courses.course_running.length}
            </p>
          </div>
          <div className={courseCountStyle.card}>
            <p className={courseCountStyle.status}>Completed</p>
            <p className={courseCountStyle.count}>
              {courses.course_completed.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CYFStaffDashboard;
