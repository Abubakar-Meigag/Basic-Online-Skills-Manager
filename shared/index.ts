export enum OrganizationType {
  COMMERCIAL_PARTNER = "commercial",
  OUTREACH_PARTNER = "outreach",
  CYF_STAFF = "cyf_staff",
}

export type CourseStatus =
  | "request_pending"
  | "request_open"
  | "request_cancelled"
  | "request_claimed"
  | "request_confirmed"
  | "course_running"
  | "course_completed";