import type { UserOrPartnerStatus } from "../../data/dataType";

export const userOrPartnerStatusStyles: Record<UserOrPartnerStatus, string> = {
  active: "bg-green-100 text-green-800",
  not_active: "bg-red-100 text-red-800",
};
