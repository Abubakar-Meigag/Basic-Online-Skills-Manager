import { useCallback, useEffect, useState } from "react";
import CYFStaffTable from "../../components/CYFStaffTable/CYFStaffTable";
import CourseCount from "../../components/CourseCount/CourseCount";

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
        <div className="m-10">
          <div className="courses-count flex justify-between w-4xl mb-10">
            <CourseCount
              type="Pending Review"
              count={courses.request_pending.length}
            />
            <CourseCount type="Open" count={courses.request_open.length} />
            <CourseCount
              type="Confirmed"
              count={courses.request_confirmed.length}
            />
            <CourseCount type="Running" count={courses.course_running.length} />
            <CourseCount
              type="Completed"
              count={courses.course_completed.length}
            />
          </div>
          <CYFStaffTable courses={courses.request_pending} />
          <CYFStaffTable courses={courses.request_open} />
          <CYFStaffTable courses={courses.request_confirmed} />
          <CYFStaffTable courses={courses.course_running} />
          <CYFStaffTable courses={courses.course_completed} />
        </div>
      )}
    </div>
  );
};

export default CYFStaffDashboard;
