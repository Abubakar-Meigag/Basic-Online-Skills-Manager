import { OrganizationType } from "../../data/dataType";

export const mockStaffUser = {
  id: "user-1",
  email: "staff@codeyourfuture.io",
  is_active: true,
  org_type: OrganizationType.CYF_STAFF,
  organisation_id: "org-1",
};

export const mockAuthUserLookup = (
  pool: any,
  user = mockStaffUser,
  routeResult: any = { rows: [] },
) => {
  (pool.query as any).mockImplementation(async (sql: string) => {
    if (sql.includes("org.type AS org_type")) {
      return { rows: [user] };
    }

    if (routeResult instanceof Error) {
      throw routeResult;
    }

    return routeResult;
  });
};
