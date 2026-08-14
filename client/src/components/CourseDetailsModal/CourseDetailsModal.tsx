import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { useState } from "react";
import CourseDetail from "../CourseDetail/CourseDetail";
import type { CoursePipelineItem } from "../../data/dataType";

const CourseDetailsModal = ({ course }: { course: CoursePipelineItem }) => {
  const [isOpen, setIsOpen] = useState(false);

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
            <DialogTitle className="font-bold">Course Details</DialogTitle>
            <div className="flex justify-between mb-10">
              <div>
                <CourseDetail
                  label="Outreach Partner"
                  detail={course.outreach_org}
                />
                <CourseDetail label="Start Date" detail={course.start_date} />
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
                <CourseDetail label="Status" detail={course.status} />{" "}
                <CourseDetail
                  label="Contact Person"
                  detail={course.contact_name}
                />
              </div>
            </div>
            <button className="px-5">Publish</button>
            <button className="px-5">Reschedule</button>
            <button className="px-5">Confirm</button>
            <button className="px-5">Cancel</button>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default CourseDetailsModal;
