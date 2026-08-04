export type NavLinkItem = {
  label: string;
  path: string;
};

export const navLinks: NavLinkItem[] = [
  {
    label: "Requested Courses",
    path: "/dashboard/commercial-partner/requested-courses",
  },
  {
    label: "Request New Course",
    path: "/dashboard/commercial-partner/request-new-course",
  },
  {
    label: "Find Opportunities",
    path: "/dashboard/outreach-partner/find-opportunities",
  },
  {
    label: "My Hosted Courses",
    path: "/dashboard/outreach-partner/hosted-courses",
  },
  {
    label: "Request Pipeline",
    path: "/dashboard/cyf-staff/request-pipeline",
  },
  {
    label: "Manage Partners",
    path: "/dashboard/cyf-staff/manage-partners",
  },
  {
    label: "Audit Log",
    path: "/dashboard/cyf-staff/audit-log",
  },
];
