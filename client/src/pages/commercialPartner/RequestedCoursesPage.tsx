import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import DataTable, { type TableColumn } from "../../components/DataTable.tsx";
import PageHeader from "../../components/PageHeader";
import { courses, organisations } from "../../data/db.ts";
import type { Course } from "../../data/dataType.ts";
import { statusStyles } from "../../lib/constants/statusStyles.ts";
import { navLinks } from "../../lib/constants/navLinks.ts";

const LOGGED_IN_ORG_NAME = "Capgemini";

const getCourseColumns = (
  outreachPartnerById: Record<string, string>,
): TableColumn<Course>[] => [
  {
    header: "ID",
    accessor: "id",
    cellClassName: "text-slate-500",
  },
  {
    header: "CONTRACT NAME",
    accessor: "contract_name",
    cellClassName: "font-bold text-slate-900",
  },
  {
    header: "LOCATION",
    accessor: "city",
    cellClassName: "text-slate-600",
  },
  {
    header: "TRAINEE TARGET",
    accessor: "trainee_target",
    cellClassName: "text-slate-600",
  },
  {
    header: "DEADLINE",
    accessor: "deadline",
    cellClassName: "text-slate-600",
  },
  {
    header: "STATUS",
    accessor: "status",
    render: (value) => {
      const statusKey = String(value) as keyof typeof statusStyles;
      const statusStyle =
        statusStyles[statusKey] ?? "bg-slate-100 text-slate-700";
      const statusText = String(value).replace(/_/g, " ");

      return (
        <span
          className={`inline-flex rounded-sm px-2 py-1 text-xs font-semibold ${statusStyle}`}
        >
          {statusText}
        </span>
      );
    },
    cellClassName: "text-slate-600",
  },
  {
    header: "OUTREACH PARTNER",
    accessor: "outreach_org_id",
    render: (value) => {
      if (!value) {
        return "-";
      }

      return outreachPartnerById[value] ?? value;
    },
    cellClassName: "text-slate-600",
  },
  {
    header: "ACTIONS",
    accessor: "id",
    render: (_value, row) => {
      const isEditableByCommercial = row.status === "request_pending";

      return (
        <div className="flex gap-6">
          <button
            type="button"
            className="font-medium text-[#EE2A24] underline"
          >
            View Details
          </button>
          {isEditableByCommercial ? (
            <button
              type="button"
              className="font-medium text-blue-600 underline hover:text-blue-800"
            >
              Edit
            </button>
          ) : null}
        </div>
      );
    },
    cellClassName: "text-slate-600",
  },
];

export default function RequestedCoursesPage() {
  const location = useLocation();

  // Logic: Create a scoped list containing only this partner's courses.
  const capgeminiOrgId = useMemo(() => {
    let foundId: string | undefined;

    for (let i = 0; i < organisations.length; i++) {
      const currentOrg = organisations[i];
      if (currentOrg.organisation_name === LOGGED_IN_ORG_NAME) {
        foundId = currentOrg.id;
        break;
      }
    }

    return foundId;
  }, [organisations]);

  const outreachPartnerById = useMemo(() => {
    const foundOutreachPartners: Record<string, string> = {};

    for (let i = 0; i < organisations.length; i++) {
      const org = organisations[i];

      foundOutreachPartners[org.id] = org.organisation_name;
    }

    return foundOutreachPartners;
  }, [organisations]);

  const courseColumns = useMemo(
    () => getCourseColumns(outreachPartnerById),
    [outreachPartnerById],
  );

  const capgeminiCourses = useMemo(() => {
    const filteredCourses = courses.filter(
      (course) => course.commercial_org_id === capgeminiOrgId,
    );

    return filteredCourses;
  }, [courses, capgeminiOrgId]);

  const currentPage = navLinks.find((link) => link.path === location.pathname);
  let pageTitle = "Dashboard";

  // If we found a matching page in our navLinks, use its label instead
  if (currentPage) {
    pageTitle = currentPage.label;
  }

  return (
    <section className="p-6">
      <div className="sticky top-0 z-20 bg-white pt-6">
        <PageHeader
          title={pageTitle}
          description="All course requests submitted by your organisation."
        />
      </div>

      {/* The Table Skeleton */}
      <div className="border border-[#E3E3E3]">
        <DataTable data={capgeminiCourses} columns={courseColumns} />
      </div>
    </section>
  );
}
