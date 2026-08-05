export type NavLinkItem = {
  label: string;
  path: string;
};

export const navLinks: NavLinkItem[] = [
  {
    label: "Requested Courses",
    path: "/commercial-partner/requested-courses",
  },
  {
    label: "Request New Course",
    path: "/commercial-partner/request-new-course",
  },
  {
    label: "Find Opportunities",
    path: "/outreach-partner/find-opportunities",
  },
  {
    label: "My Hosted Courses",
    path: "/outreach-partner/hosted-courses",
  },
  {
    label: "Request Pipeline",
    path: "/cyf-staff/request-pipeline",
  },
  {
    label: "Manage Partners",
    path: "/cyf-staff/manage-partners",
  },
  {
    label: "Audit Log",
    path: "/cyf-staff/audit-log",
  },
];
