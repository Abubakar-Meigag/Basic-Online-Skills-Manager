import type { CourseStatus } from "../../data/dataType";
import type { UserOrPartnerStatus } from "../../data/dataType";

export const statusStyles: Record<CourseStatus, string> = {
  request_pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  request_open: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  request_claimed: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  request_confirmed: "bg-green-50 text-green-700 border border-green-200",
  course_completed: "bg-green-50 text-green-700 border border-green-200",
  course_running: "bg-blue-50 text-blue-700 border border-blue-200",
  request_cancelled: "bg-red-50 text-red-700 border border-red-200",
};

export const userOrPartnerStatusStyles: Record<UserOrPartnerStatus, string> = {
  active: "bg-green-100 text-green-800",
  not_active: "bg-red-100 text-red-800",
};
