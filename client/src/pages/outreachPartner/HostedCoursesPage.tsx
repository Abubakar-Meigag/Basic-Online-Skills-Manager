import { useState, useEffect, useCallback, useRef } from "react";
import { parseISO, format } from "date-fns";
import tableHeaderStyle from "../../lib/constants/tableHeaderStyle";
import { statusStyles } from "../../lib/constants/statusStyles";
import statusLabel from "../../utils/statusLabel";
import PageHeader from "../../components/PageHeader";
import { api } from "../../auth/authApi";

// Interface for backend response or DataType
export interface HostedCourse {
  id: string;
  course_name: string;
  partner_organisation?: string | null;
  commercial_org?: string;
  city?: string;
  venue?: string | null;
  trainee_target: number;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
}

// Style map objects outside the component function
const STYLES = {
  container: "p-6",
  loadingContainer: "flex flex-col items-center justify-center py-12",
  spinner:
    "w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin",
  loadingText: "mt-3 text-sm text-gray-500 font-medium",
  errorContainer:
    "my-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm",
  errorTitle: "font-semibold",
  emptyContainer:
    "my-8 p-8 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50",
  emptyTitle: "text-gray-600 font-medium text-base",
  emptyText: "text-gray-400 text-sm mt-1",
  table: "w-full text-left border border-[#E3E3E3] border-collapse mt-6",
  tableHeaderRow: "bg-[#F3F3F3]",
  tableRow: "border-b border-[#F3F3F3] hover:bg-[#F3F3F3] transition-colors",
  cellMuted: "py-4 text-sm text-slate-500 pl-5",
  cellText: "py-4 text-sm text-slate-600 px-4",
  cellTextBold: "py-4 text-sm font-semibold text-slate-900 px-4",
  cellTarget: "py-4 text-sm text-slate-600 px-14",
  badgeBase: "inline-flex rounded-sm px-2 py-1 text-xs font-semibold",
} as const;

const HostedCoursesPage = () => {
  const [courses, setCourses] = useState<HostedCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const getHostedCourses = useCallback(async () => {
    try {
      const res = await api.get("/outreach/courses");

      if (isMounted.current) {
        setCourses(res.data);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      if (isMounted.current) {
        setError("Failed to fetch hosted courses. Please try again.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const runFetch = async () => {
      if (!cancelled) {
        await getHostedCourses();
      }
    };

    runFetch();

    return () => {
      cancelled = true;
    };
  }, [getHostedCourses]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "TBD";
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <section className={STYLES.container}>
      <PageHeader
        title="Hosted Courses"
        description="View and track all courses assigned to and hosted by your organisation."
      />

      {/* Loading State */}
      {loading && (
        <div className={STYLES.loadingContainer}>
          <div className={STYLES.spinner} />
          <p className={STYLES.loadingText}>Loading hosted courses...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className={STYLES.errorContainer}>
          <p className={STYLES.errorTitle}>Unable to load courses</p>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && courses.length === 0 && (
        <div className={STYLES.emptyContainer}>
          <p className={STYLES.emptyTitle}>No hosted courses found</p>
          <p className={STYLES.emptyText}>
            There are currently no active or hosted courses assigned to your
            organisation.
          </p>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && courses.length > 0 && (
        <table className={STYLES.table}>
          <thead>
            <tr className={STYLES.tableHeaderRow}>
              <th className={`${tableHeaderStyle} pl-5`}>Course Name</th>
              <th className={`${tableHeaderStyle} px-4`}>Commercial Partner</th>
              <th className={`${tableHeaderStyle} px-4`}>Venue / Location</th>
              <th className={`${tableHeaderStyle} px-14`}>Trainee Target</th>
              <th className={`${tableHeaderStyle} px-4`}>Start Date</th>
              <th className={`${tableHeaderStyle} px-4`}>End Date</th>
              <th className={`${tableHeaderStyle} px-4`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const { statusStyle, statusText } = statusLabel(course.status);
              const appliedStatusStyle =
                statusStyle ||
                statusStyles[course.status as keyof typeof statusStyles] ||
                "bg-slate-100 text-slate-700";

              return (
                <tr key={course.id} className={STYLES.tableRow}>
                  <td className={STYLES.cellTextBold}>{course.course_name}</td>
                  <td className={STYLES.cellText}>
                    {course.partner_organisation ||
                      course.commercial_org ||
                      "—"}
                  </td>
                  <td className={STYLES.cellText}>
                    {course.venue || course.city || "—"}
                  </td>
                  <td className={STYLES.cellTarget}>{course.trainee_target}</td>
                  <td className={STYLES.cellText}>
                    {formatDate(course.start_date)}
                  </td>
                  <td className={STYLES.cellText}>
                    {formatDate(course.end_date)}
                  </td>
                  <td className={STYLES.cellText}>
                    <span
                      className={`${STYLES.badgeBase} ${appliedStatusStyle}`}
                    >
                      {statusText || course.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default HostedCoursesPage;
