export enum ORGANISATION_TYPE {
  CYF_STAFF = "cyf_staff",
  COMMERCIAL = "commercial",
  OUTREACH = "outreach",
} 

export type OrganisationType = ORGANISATION_TYPE;

export const PARTNER_TYPES: ORGANISATION_TYPE[] = [
  ORGANISATION_TYPE.COMMERCIAL,
  ORGANISATION_TYPE.OUTREACH,
];
