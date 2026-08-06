export const ORGANISATION_TYPE = {
  CYF_STAFF: "cyf_staff",
  COMMERCIAL: "commercial",
  OUTREACH: "outreach",
} as const;

export type OrganisationType =
  (typeof ORGANISATION_TYPE)[keyof typeof ORGANISATION_TYPE];

export const PARTNER_TYPES = [
  ORGANISATION_TYPE.COMMERCIAL,
  ORGANISATION_TYPE.OUTREACH,
] as const;
