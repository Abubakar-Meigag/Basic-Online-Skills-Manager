import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { useState } from "react";
import CourseDetail from "./CourseDetail/CourseDetail";
import statusLabel from "../../utils/statusLabel";
import CourseActionButton from "./CourseActionButton/CourseActionButton";
import formatDate from "../../utils/formatDate";
import { api } from "../../auth/authApi";
import type { CoursePipelineItem } from "../../data/dataType";

const CourseDetailsModal = ({ course }: { course: CoursePipelineItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayError, setDisplayError] = useState("");
  const status = course.status;
  const { statusStyle, statusText } = statusLabel(status);

  const publishCourse = async () => {
    try {
      await api.patch(`/course/${course.id}/status`, {
        status: "request_open",
      });
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      setDisplayError(`Error: ${error}`);
      setTimeout(() => setDisplayError(""), 30000);
    }
  };

  const rescheduleCourse = async () => {
    try {
      await api.patch(`/course/${course.id}/status`, {
        status: "request_open",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const confirmCourse = async () => {
    try {
      await api.patch(`/course/${course.id}/status`, {
        status: "request_confirmed",
      });
    } catch (error) {
      console.error(error);
      setDisplayError(`Error: ${error}`);
      setTimeout(() => setDisplayError(""), 30000);
    }
  };

  const cancelCourse = () => {};

  return (
    <>
      <button
        className="text-red-600 hover:text-red-800 font-medium"
        onClick={() => setIsOpen(true)}
      >
        View details
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12 border-[#E3E3E3]">
            <DialogTitle className="font-bold text-xl">
              Course Details
            </DialogTitle>
            {displayError && <p className="text-red-600">{displayError}</p>}
            <div className="flex justify-between mb-10">
              <div className="mr-25">
                <CourseDetail label="ID" detail={course.id} />
                <CourseDetail
                  label="Outreach Partner"
                  detail={course.outreach_org}
                />
                <CourseDetail
                  label="Start Date"
                  detail={formatDate(course.start_date)}
                />
                <CourseDetail
                  label="Trainee Target"
                  detail={course.trainee_target}
                />
                <CourseDetail
                  label="Venue Address"
                  detail={course.venue_address}
                />
                <CourseDetail
                  label="Contact Email"
                  detail={course.contact_email}
                />
              </div>
              <div>
                <CourseDetail
                  label="Commercial Partner"
                  detail={course.commercial_org}
                />
                <CourseDetail label="City" detail={course.city} />
                <CourseDetail label="Duration" detail="3 Weeks" />
                <CourseDetail
                  label="Status"
                  style={`${statusStyle} inline-flex rounded-sm px-2 py-1 text-xs font-semibold mt-3`}
                  detail={statusText}
                />
                <CourseDetail
                  label="Contact Person"
                  detail={course.contact_name}
                />
              </div>
            </div>
            <div className="button-bank grid grid-cols-2 gap-5">
              {status === "request_pending" && (
                <CourseActionButton
                  text="Publish"
                  colour="bg-blue-500"
                  action={publishCourse}
                />
              )}

              {status !== "course_running" && status !== "course_completed" && (
                <CourseActionButton
                  text="Reschedule"
                  colour="bg-yellow-500"
                  action={rescheduleCourse}
                />
              )}

              {status === "request_claimed" && (
                <CourseActionButton
                  text="Confirm"
                  colour="bg-green-500"
                  action={confirmCourse}
                />
              )}

              {status !== "course_running" && status !== "course_completed" && (
                <CourseActionButton
                  text="Cancel Course"
                  colour="bg-red-500"
                  action={cancelCourse}
                />
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default CourseDetailsModal;
