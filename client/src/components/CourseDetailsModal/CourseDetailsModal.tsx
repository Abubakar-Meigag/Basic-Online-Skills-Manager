import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
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
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
            <DialogTitle className="font-bold">Course Details</DialogTitle>
            <CourseDetail label="ID" detail={course.id.slice(-5)} />
            <CourseDetail
              label="Commercial Partner"
              detail={course.commercial_org}
            />
            <CourseDetail
              label="Outreach Partner"
              detail={course.outreach_org}
            />
            <CourseDetail label="City" detail={course.city} />
            <CourseDetail label="Start Date" detail={course.start_date} />
            <CourseDetail label="Duration" detail="3 Weeks" />
            <CourseDetail
              label="Trainee Target"
              detail={course.trainee_target}
            />
            <CourseDetail label="Status" detail={course.status} />
            <CourseDetail label="Venue Address" detail={course.venue_address} />
            <CourseDetail label="Contact Person" detail={course.contact_name} />
            <CourseDetail label="Contact Email" detail={course.contact_email} />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default CourseDetailsModal;
