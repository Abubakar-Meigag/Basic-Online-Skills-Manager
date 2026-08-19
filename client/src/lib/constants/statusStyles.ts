import type { CourseStatus } from "../../data/dataType";

export const statusStyles: Record<CourseStatus, string> = {
  request_pending:
    "bg-amber-100 text-center text-amber-600 border-2 min-w-[120px] text-center border-amber-300 rounded-lg",
  request_open:
    "bg-slate-100 text-center text-slate-800 border-2 min-w-[120px] text-center border-slate-400 rounded-lg",
  request_claimed:
    "bg-yellow-50 text-center text-yellow-700 border-2 min-w-[120px] text-center border-yellow-500 rounded-lg",
  request_confirmed:
    "bg-green-50 text-center text-green-700 border-2 min-w-[120px] text-center border-green-300 rounded-lg",
  course_completed:
    "bg-stone-100 text-center text-stone-700 border-2 min-w-[120px] text-center border-stone-400 rounded-lg",
  course_running:
    "bg-blue-100 text-center text-blue-700 border-2 min-w-[120px] text-center border-blue-300 rounded-lg",
  request_cancelled:
    "bg-stone-50 text-center text-gray-700 border-2 min-w-[120px] text-center border-gray-400 rounded-lg",
};
