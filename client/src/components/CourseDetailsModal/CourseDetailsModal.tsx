// There are some commented code in this file. These code can be used for future functionality.

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { useCallback, useEffect, useState } from "react";
import CourseDetail from "./CourseDetail/CourseDetail";
import statusLabel from "../../utils/statusLabel";
import CourseActionButton from "./CourseActionButton/CourseActionButton";
import formatDate from "../../utils/formatDate";
import { api } from "../../auth/authApi";
import type { Course } from "../../data/dataType";

const CourseDetailsModal = ({ id }: { id: string }) => {
  const [course, setCourse] = useState<Course>();
  const [isOpen, setIsOpen] = useState(false);
  const [displayError, setDisplayError] = useState("");
  const status = course?.status ?? "";
  const { statusStyle, statusText } = statusLabel(status);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await api.get(`/course-details/staff/${id}`);
      setCourse(res.data.data);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourse();
  }, [fetchCourse]);

  const publishCourse = async () => {
    if (!course) return;
    try {
      await api.patch(`/course/${course.id}/status`, { status: "request_open" });
      window.location.reload();
    } catch (error) {
      console.error(error);
      setDisplayError(`Error: ${error}`);
      setTimeout(() => setDisplayError(""), 30000);
    }
  };

  const confirmCourse = async () => {
    if (!course) return;
    try {
      await api.patch(`/course/${course.id}/status`, { status: "request_confirmed" });
      window.location.reload();
    } catch (error) {
      console.error(error);
      setDisplayError(`Error: ${error}`);
      setTimeout(() => setDisplayError(""), 30000);
    }
  };

  const courseRunning = async () => {
    if (!course) return;
    try {
      await api.patch(`/course/${course.id}/status`, { status: "course_running" });
      window.location.reload();
    } catch (error) {
      console.error(error);
      setDisplayError(`Error: ${error}`);
      setTimeout(() => setDisplayError(""), 30000);
    }
  };

  const courseCompleted = async () => {
    if (!course) return;
    try {
      await api.patch(`/course/${course.id}/status`, { status: "course_completed" });
      window.location.reload();
    } catch (error) {
      console.error(error);
      setDisplayError(`Error: ${error}`);
      setTimeout(() => setDisplayError(""), 30000);
    }
  };

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
          <DialogPanel className="w-4xl space-y-6 border bg-white p-12 border-[#b99898] max-h-[90vh] overflow-y-auto">
            <DialogTitle className="font-bold text-xl">Course Details</DialogTitle>
            {displayError && <p className="text-red-600">{displayError}</p>}

            {course && (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-[#E3E3E3]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#333333]">Status:</span>
                    <span className={`${statusStyle} inline-flex rounded-sm px-2 py-1 text-xs font-semibold`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="button-bank flex gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#333333]">Action:</span>
                      {status === "request_pending" && (
                        <CourseActionButton text="Publish" colour="bg-amber-600 min-w-[220px] cursor-pointer" action={publishCourse} />
                      )}
                      {status === "request_claimed" && (
                        <CourseActionButton text="Confirm" colour="bg-green-500 min-w-[220px] cursor-pointer" action={confirmCourse} />
                      )}
                      {status === "request_confirmed" && (
                        <CourseActionButton text="Running" colour="bg-blue-700 min-w-[220px] cursor-pointer" action={courseRunning} />
                      )}
                      {status === "course_running" && (
                        <CourseActionButton text="Complete" colour="bg-gray-700 min-w-[220px] cursor-pointer" action={courseCompleted} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-16 gap-y-1">
                  {/* Left column */}
                  <CourseDetail label="ID" detail={course.id.slice(-5)} />
                  <CourseDetail label="Commercial Partner" detail={course.commercial_org} />
                  <CourseDetail label="Account Name" detail={course.account_name || " - "} />
                  <CourseDetail label="Contract Name" detail={course.contract_name || " - "} />
                  <CourseDetail label="City" detail={course.city} />
                  <CourseDetail label="Trainee Target" detail={String(course.trainee_target)} />
                  <CourseDetail label="Deadline" detail={formatDate(course.deadline)} />
                  <CourseDetail label="Start Date" detail={course.start_date ? formatDate(course.start_date) : " - "} />
                  <CourseDetail label="Outreach Partner" detail={course.outreach_org || " - "} />
                  <CourseDetail label="Venue Address" detail={course.venue_address || " - "} />

                  {/* Right column */}
                  <CourseDetail label="Contact Person" detail={course.contact_name || " - "} />
                  <CourseDetail label="Contact Email" detail={course.contact_email || " - "} />
                  <CourseDetail label="Client Group" detail={course.client_group_description || " - "} />
                  <CourseDetail label="Tech Level" detail={course.tech_level || " - "} />
                  <CourseDetail label="Goal" detail={course.goal || " - "} />
                  <CourseDetail label="Lunch Arrangement" detail={course.lunch_arrangement || " - "} />
                  <CourseDetail label="Expenses Notes" detail={course.expenses_notes || " - "} />
                  <CourseDetail label="Note" detail={course.note || " - "} />
                </div>
              </>
            )}

          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default CourseDetailsModal;
