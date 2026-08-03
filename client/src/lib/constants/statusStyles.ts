<<<<<<< HEAD
import type { CourseStatus } from "../../data/dataType";

export const statusStyles: Record<CourseStatus, string> = {
=======
export const statusStyles: Record<string, string> = {
>>>>>>> 2e86ede (West Midlands | 26 July Launch | Iswat Bello | Basic Online Skills Manager | 26 UI commercial partner dashboard (#41))
  request_pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  request_open: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  request_claimed: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  request_confirmed: "bg-green-50 text-green-700 border border-green-200",
  course_completed: "bg-green-50 text-green-700 border border-green-200",
  course_running: "bg-blue-50 text-blue-700 border border-blue-200",
  request_cancelled: "bg-red-50 text-red-700 border border-red-200",
};
