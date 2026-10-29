import { OrganizationType } from "@bosm/shared";

export const ORGANISATION_TYPE = OrganizationType;
export type OrganisationType = OrganizationType;
export type { OrganizationType };

export const PARTNER_TYPES: OrganizationType[] = [
  OrganizationType.CYF_STAFF,
  OrganizationType.COMMERCIAL_PARTNER,
  OrganizationType.OUTREACH_PARTNER,
];
