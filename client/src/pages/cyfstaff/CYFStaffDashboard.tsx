import { useCallback, useEffect, useState } from "react";
import CYFStaffTable from "../../components/CYFStaffTable/CYFStaffTable";

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
      <div className="flex justify-between mt-10 mb-20 mx-12">
        <h2 className="text-3xl font-bold text-[#333333]">Request Pipeline</h2>
        <p>Courses grouped by their current stage</p>
      </div>
      {courses && (
        <div className="courses-count">
          <div>
            <p>Pending Review</p>
            <p>{courses.request_pending.length}</p>
          </div>
          <div>
            <p>Open</p>
            <p>{courses.request_open.length}</p>
          </div>
          <div>
            <p>Confirmed</p>
            <p>{courses.request_confirmed.length}</p>
          </div>
          <div>
            <p>Running</p>
            <p>{courses.course_running.length}</p>
          </div>
          <div>
            <p>Completed</p>
            <p>{courses.course_completed.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CYFStaffDashboard;
