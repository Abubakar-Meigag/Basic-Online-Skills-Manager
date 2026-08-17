import { useCallback, useEffect, useState } from "react";
import CYFStaffTable from "../../components/CYFStaffTable/CYFStaffTable";
import CourseCount from "../../components/CourseCount/CourseCount";
import type { CoursePipelineItem } from "../../data/dataType";
import { api } from "../../auth/authApi";

interface CoursePipelineItems {
  request_pending: CoursePipelineItem[];
  request_open: CoursePipelineItem[];
  request_claimed: CoursePipelineItem[];
  request_confirmed: CoursePipelineItem[];
  course_running: CoursePipelineItem[];
  course_completed: CoursePipelineItem[];
}

const CYFStaffDashboard = () => {
  const [courses, setCourses] = useState<CoursePipelineItems>();

  const getCourses = useCallback(async () => {
    try {
      const res = await api.get("/course-pipeline");
      setCourses(res.data);
    } catch (error) {
      console.error("Authorization failed fetching course pipeline:", error);
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
          <p className="bg-yellow-50 text-yellow-700 border-4 w-fit p-1 mb-2 font-bold border-yellow-200">
            Request Pending
          </p>
          <CYFStaffTable courses={courses.request_pending} />
          <p className="bg-yellow-50 text-yellow-600 border-4 w-fit p-1 mb-2 font-bold border-yellow-300">
            Request Open
          </p>
          <CYFStaffTable courses={courses.request_open} />
          <p className="bg-yellow-50 text-yellow-700 border-4 w-fit p-1 mb-2 font-bold border-yellow-500">
            Request Claimed
          </p>
          <CYFStaffTable courses={courses.request_claimed} />
          <p className="bg-green-50 text-green-700 border-4 w-fit p-1 mb-2 font-bold border-green-300">
            Request Confirmed
          </p>
          <CYFStaffTable courses={courses.request_confirmed} />
          <p className="bg-blue-50 text-blue-700 border-4 w-fit p-1 mb-2 font-bold border-blue-300">
            Course Running
          </p>
          <CYFStaffTable courses={courses.course_running} />
          <p className="bg-green-50 text-green-700 border-4 w-fit p-1 mb-2 font-bold border-green-500">
            Course Completed
          </p>
          <CYFStaffTable courses={courses.course_completed} />
        </div>
      )}
    </div>
  );
};

export default CYFStaffDashboard;
