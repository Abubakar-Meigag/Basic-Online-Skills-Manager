import { courses, organisations } from "../../../server/src/data/db.ts";

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

const statusStyles: Record<string, string> = {
  request_pending: "bg-yellow-100 text-yellow-800",
  request_open: "bg-yellow-100 text-yellow-800",
  request_claimed: "bg-yellow-100 text-yellow-800",
  request_confirmed: "bg-green-100 text-green-800",
  course_completed: "bg-green-100 text-green-800",
  course_running: "bg-red-100 text-red-800",
  request_cancelled: "bg-red-100 text-red-800",
};

let capgeminiOrgId: string | undefined;

for (let i = 0; i < organisations.length; i++) {
  const currentOrg = organisations[i];
  if (currentOrg.organisation_name === LOGGED_IN_ORG_NAME) {
    capgeminiOrgId = currentOrg.id;
    break;
  }
}

const outreachPartnerById: Record<string, string> = {};

for (let i = 0; i < organisations.length; i++) {
  const org = organisations[i];

  outreachPartnerById[org.id] = org.organisation_name;
}

export default function CommercialDashboard() {
  // Logic: Create a scoped list containing only this partner's courses.
  const capgeminiCourses = courses.filter(
    (course) => course.commercial_org_id === capgeminiOrgId,
  );

  return (
    <section className="p-6">
      {/* The Header: Flexbox layout to push items to opposite sides */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <p className="text-slate-600 text-sm">
            Logged in as {LOGGED_IN_ORG_NAME}
          </p>
        </div>
        <button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Request New Course
        </button>
      </header>

      {/* The Table Skeleton */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-sm uppercase">
            {tableHeaders.map((header) => (
              <th key={header} className="pb-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
      </table>
    </section>
  );
}
