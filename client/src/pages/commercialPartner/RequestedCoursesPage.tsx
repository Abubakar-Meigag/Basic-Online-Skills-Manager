import { useState, useEffect, useCallback } from "react";
import PageHeader from "../../components/PageHeader";
import DataTable, { type TableColumn } from "../../components/DataTable";
import type { Course } from "../../data/dataType.ts";
import { parseISO, format } from "date-fns";
import statusLabel from "../../utils/statusLabel.ts";
import { api } from "../../auth/authApi";

const columns: TableColumn<Course>[] = [
  {
    header: "ID",
    accessor: "id",
    headerClassName: "text-center pr-15",
    cellClassName: "text-center text-slate-600 font-mono pr-10",
    render: (value) => String(value).slice(0, 5),
  },
  {
    header: "Contract Name",
    accessor: "contract_name",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
  },
  {
    header: "Location",
    accessor: "city",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
  },
  {
    header: "Trainee Target",
    accessor: "trainee_target",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
  },
  {
    header: "Deadline",
    accessor: "deadline",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
    render: (value) => format(parseISO(String(value)), "dd/MM/yyyy"),
  },
  {
    header: "Status",
    accessor: "status",
    headerClassName: "text-center",
    cellClassName: "text-center",
    render: (value) => {
      const { statusStyle, statusText } = statusLabel(String(value));
      return (
        <span
          className={`inline-flex rounded-sm justify-center px-2 py-1 text-xs font-semibold border ${statusStyle}`}
        >
          {statusText}
        </span>
      );
    },
  },
];

const RequestedCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  const getCourses = useCallback(async () => {
    try {
      const res = await api.get("/commercial-dashboard");
      const data = res.data;
      setCourses(data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  return (
    <section className="p-6">
      <div className="sticky top-0 z-20 bg-white pt-2">
        <PageHeader
          title="Requested Courses"
          description="All course requests submitted by your organisation."
        />
      </div>

      <div className="max-h-[80vh] overflow-y-auto border border-[#E3E3E3] mt-2">
        <DataTable data={courses} columns={columns} />
      </div>
    </section>
  );
};

export default RequestedCoursesPage;
