// Types
export type Organisation = {
  id: string;
  organisation_name: string;
  city: string;
  type: OrganizationType;
  email_domain: string;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  organisation_id: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

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

export type Course = {
  id: string;
  course_name: string;
  commercial_org_id: string;
  account_name: string;
  contract_name: string;
  trainee_target: number;
  deadline: string;
  city: string;
  status: CourseStatus;
  outreach_org_id: string | null;
  start_date: string | null;
  end_date: string | null;
  venue_address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  client_group_description: string | null;
  tech_level: string | null;
  goal: string | null;
  lunch_arrangement: string | null;
  expenses_notes: string | null;
  note: string | null;
  created_at: string;
};

export type AuditLogEntry = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
};
