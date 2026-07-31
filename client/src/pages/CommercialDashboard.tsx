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
