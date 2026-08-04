import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { courses, organisations } from "../../data/db.ts";
import { statusStyles } from "../../lib/constants/statusStyles.ts";
import { navLinks } from "../../lib/constants/navLinks.ts";

const LOGGED_IN_ORG_NAME = "Capgemini";

const tableHeaders = [
  "ID",
  "CONTRACT NAME",
  "LOCATION",
  "TRAINEE TARGET",
  "DEADLINE",
  "STATUS",
  "OUTREACH PARTNER",
  "ACTIONS",
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
      <header className="pb-8">
        <h1 className="text-3xl font-bold text-[#333333]">{pageTitle}</h1>
        <p className="text-[#333333] text-sm mt-2">
          All course requests submitted by your organisation.
        </p>
      </header>

      {/* The Table Skeleton */}
      <div className="border border-[#E3E3E3]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F3F3F3]">
              {tableHeaders.map((header, index) => {
                const isFirst = index === 0;

                return (
                  <th
                    key={header}
                    className={`
				py-5 
				text-[#333333]       
				text-xs font-bold uppercase tracking-wider
				${isFirst ? "pl-10" : "px-4"} 
			`}
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {capgeminiCourses.map((course) => {
              // Figure out the status color
              let statusStyle = statusStyles[course.status];
              if (!statusStyle) {
                statusStyle = "bg-slate-100 text-slate-700"; // Fallback to grey
              }

              // Remove underscores from status text (e.g. "request_open" -> "request open")
              const statusText = course.status.replace("_", " ");

              // Figure out the Outreach Partner name
              let partnerName = "-";
              if (course.outreach_org_id) {
                partnerName =
                  outreachPartnerById[course.outreach_org_id] || "-";
              }

              // Check if editing is allowed
              const isEditableByCommercial =
                course.status === "request_pending";

              return (
                <tr
                  key={course.id}
                  className="border-b border-[#F3F3F3] hover:bg-[#F3F3F3] transition-colors"
                >
                  <td className="py-4 text-sm text-slate-500 pl-5">
                    {course.id}
                  </td>
                  <td className="py-4 text-sm font-bold text-slate-900 px-4">
                    {course.contract_name}
                  </td>
                  <td className="py-4 text-sm text-slate-600 px-4">
                    {course.city}
                  </td>
                  <td className="py-4 text-sm text-slate-600 px-14">
                    {course.trainee_target}
                  </td>
                  <td className="py-4 text-sm text-slate-600 px-4">
                    {course.deadline}
                  </td>

                  <td className="py-4">
                    <span
                      className={`inline-flex rounded-sm px-2 py-1 text-xs font-semibold ${statusStyle}`}
                    >
                      {statusText}
                    </span>
                  </td>

                  <td className="py-4 text-sm text-slate-600 px-4">
                    {partnerName}
                  </td>

                  <td className="py-4 text-sm px-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                      {isEditableByCommercial ? (
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
