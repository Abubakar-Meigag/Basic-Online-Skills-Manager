import { useCallback, useEffect, useState } from "react";
import CYFStaffTable from "../../components/CYFStaffTable/CYFStaffTable";
import CourseCount from "../../components/CourseCount/CourseCount";
import PageHeader from "../../components/PageHeader";
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

  return (
    <section className="p-6">
      <div className="sticky top-0 z-20 bg-white px-8 pt-2 pb-1">
        <PageHeader
          title="Request Pipeline"
          description="Courses grouped by their current stage"
        />
      </div>

      {courses && (
        <div className="mx-8 mt-4">
          <div className="courses-count flex justify-between w-4xl mb-10">
            <CourseCount
              type="Pending Review"
              count={courses.request_pending.length}
            />
            <CourseCount type="Open" count={courses.request_open.length} />
            <CourseCount
              type="Claimed"
              count={courses.request_claimed.length}
            />
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

          <p className="bg-yellow-100 text-amber-600 border-2 w-fit p-1 mb-2 font-bold border-amber-300 rounded-lg">
            Request Pending
          </p>
          <CYFStaffTable courses={courses.request_pending} />

          <p className="bg-slate-100 text-slate-800 border-2 w-fit p-1 mb-2 font-bold border-slate-400 rounded-lg mt-8">
            Request Open
          </p>
          <CYFStaffTable courses={courses.request_open} />

          <p className="bg-yellow-50 text-yellow-700 border-2 w-fit p-1 mb-2 font-bold border-yellow-500 rounded-lg mt-8">
            Request Claimed
          </p>
          <CYFStaffTable courses={courses.request_claimed} />

          <p className="bg-green-50 text-green-700 border-2 w-fit p-1 mb-2 font-bold border-green-300 rounded-lg mt-8">
            Request Confirmed
          </p>
          <CYFStaffTable courses={courses.request_confirmed} />

          <p className="bg-blue-100 text-blue-700 border-2 w-fit p-1 mb-2 font-bold border-blue-300 rounded-lg mt-8">
            Course Running
          </p>
          <CYFStaffTable courses={courses.course_running} />

          <p className="bg-stone-100 text-shadow-olive-700 border-2 w-fit p-1 mb-2 font-bold border-stone-400 rounded-lg mt-8">
            Course Completed
          </p>
          <CYFStaffTable courses={courses.course_completed} />
        </div>
      )}
    </section>
  );
};

export default CYFStaffDashboard;
