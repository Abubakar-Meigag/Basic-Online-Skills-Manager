export enum OrganizationType {
  CYF_STAFF = "cyf_staff",
  COMMERCIAL = "commercial",
  OUTREACH = "outreach",
}

export type CourseStatus =
  | "request_pending"
  | "request_open"
  | "request_cancelled"
  | "request_claimed"
  | "request_confirmed"
  | "course_running"
  | "course_completed";