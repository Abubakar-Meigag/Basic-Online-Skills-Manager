import { useState, useEffect, useCallback, useRef } from "react";
import { parseISO, format } from "date-fns";
import statusLabel from "../../utils/statusLabel";
import PageHeader from "../../components/PageHeader";
import DataTable, { type TableColumn } from "../../components/DataTable";
import { api } from "../../auth/authApi";

export type HostedCourse = {
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
};

const columns: TableColumn<HostedCourse>[] = [
  {
    header: "Course Name",
    accessor: "course_name",
    cellClassName: "font-semibold text-slate-900",
  },
  {
    header: "Sponsor",
    accessor: "partner_organisation",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
    render: (_, row) => row.partner_organisation || row.commercial_org || "—",
  },
  {
    header: "Venue",
    accessor: "venue",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
    render: (_, row) => row.venue || row.city || "—",
  },
  {
    header: "Trainee Target",
    accessor: "trainee_target",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
  },
  {
    header: "Start Date",
    accessor: "start_date",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
    render: (val) =>
      val ? format(parseISO(String(val)), "dd/MM/yyyy") : "TBD",
  },
  {
    header: "End Date",
    accessor: "end_date",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
    render: (val) =>
      val ? format(parseISO(String(val)), "dd/MM/yyyy") : "TBD",
  },
  {
    header: "Status",
    accessor: "status",
    headerClassName: "text-center",
    cellClassName: "text-center",
    render: (val) => {
      const { statusStyle, statusText } = statusLabel(String(val));
      return (
        <span
          className={`inline-flex rounded-sm px-2 py-1 text-xs font-semibold ${statusStyle}`}
        >
          {statusText}
        </span>
      );
    },
  },
];

const HostedCoursesPage = () => {
  const [courses, setCourses] = useState<HostedCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef<boolean>(true);

  const getHostedCourses = useCallback(async () => {
    try {
      setLoading(true);
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
    isMounted.current = true;
    getHostedCourses();

    return () => {
      isMounted.current = false;
    };
  }, [getHostedCourses]);

  return (
    <section className="p-6">
      <div className="sticky top-0 z-20 bg-white px-8 pt-2 pb-1">
        <PageHeader
          title="My Hosted Courses"
          description="View and track all courses assigned to and hosted by your organisation."
        />
      </div>

      <div className="mx-8 mt-2 overflow-y-auto rounded-lg border border-gray-200 bg-white max-h-[calc(100vh-150px)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-500 font-medium">
              Loading hosted courses...
            </p>
          </div>
        ) : error ? (
          <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <p className="font-semibold">Unable to load courses</p>
            <p>{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="my-8 p-8 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
            <p className="text-gray-600 font-medium text-base">
              No hosted courses found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              There are currently no active courses assigned to your
              organisation.
            </p>
          </div>
        ) : (
          <DataTable<HostedCourse> data={courses} columns={columns} />
        )}
      </div>
    </section>
  );
};

export default HostedCoursesPage;
