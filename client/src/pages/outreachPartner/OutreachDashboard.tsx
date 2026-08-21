import { useCallback, useEffect, useState, useMemo } from "react";
import { parseISO, format } from "date-fns";
import PageHeader from "../../components/PageHeader";
import DataTable, { type TableColumn } from "../../components/DataTable";
import type { Course } from "../../data/dataType";
import { api } from "../../auth/authApi";
import ClaimOpportunity from "./ClaimOpportunity";

const OutreachDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const getCourses = useCallback(async () => {
    try {
      const res = await api.get("/opportunities");
      const data = res.data;
      const coursesByStatus = data.filter(
        (course: Course) => course.status === "request_open",
      );
      setCourses(coursesByStatus);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const columns = useMemo(
    (): TableColumn<Course>[] => [
      {
        header: "ID",
        accessor: "id",
        headerClassName: "text-center pr-15",
        cellClassName: "text-center text-slate-500 font-mono pr-10",
        render: (val) => String(val).slice(0, 5),
      },
      {
        header: "Commercial Partner",
        accessor: "commercial_org",
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
        header: "Duration",
        accessor: "id",
        headerClassName: "text-center",
        cellClassName: "text-center text-slate-600",
        render: () => "3 Weeks",
      },
      {
        header: "Deadline",
        accessor: "deadline",
        headerClassName: "text-center",
        cellClassName: "text-center text-slate-600",
        render: (val) => format(parseISO(String(val)), "dd/MM/yyyy"),
      },
      {
        header: "Actions",
        accessor: "id",
        headerClassName: "text-center",
        cellClassName: "text-center",
        render: (_, row) => (
          <button
            type="button"
            onClick={() => setSelectedCourse(row)}
            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            View Details
          </button>
        ),
      },
    ],
    [],
  );

  const handleBack = () => {
    setSelectedCourse(null);
  };

  const handleClaimed = () => {
    setSelectedCourse(null);
    getCourses();
  };

  if (selectedCourse) {
    return (
      <ClaimOpportunity
        course={selectedCourse}
        onBack={handleBack}
        onClaimed={handleClaimed}
      />
    );
  }

  return (
    <section className="p-6">
      <div className="sticky top-0 z-20 bg-white px-8 pt-2 pb-1">
        <PageHeader
          title="Available Opportunities"
          description="Browse and claim open course requests in your area."
        />
      </div>

      <div className="mx-8 mt-2 overflow-y-auto rounded-lg border border-gray-200 bg-white max-h-[calc(100vh-150px)]">
        <DataTable data={courses} columns={columns} />
      </div>
    </section>
  );
};

export default OutreachDashboard;
