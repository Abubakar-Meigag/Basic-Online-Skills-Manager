import { useState, useEffect, useCallback } from "react";
import { api } from "../../auth/authApi";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import type { TableColumn } from "../../components/DataTable";
import type { User } from "../../data/dataType";
import AddUserForm from "./addPartner/AddUserForm";
import statusLabel from "../../utils/statusLabel";
import { userOrPartnerStatusStyles } from "../../lib/constants/statusStyles";

// 1. Define columns outside the component
const columns: TableColumn<User>[] = [
  {
    header: "ID",
    accessor: "id",
    cellClassName: "text-xs text-gray-600 font-mono",
    render: (value) => String(value).slice(0, 5),
  },
  {
    header: "Organisation Name",
    accessor: "organisation_name",
    render: (value) => value || "N/A",
  },
  {
    header: "Email Address",
    accessor: "email",
    cellClassName: "font-medium text-[#333333]",
  },
  {
    header: "Status",
    accessor: "is_active",
    render: (isActive) => {
      // Map the boolean to the string key in our map
      const statusKey = isActive ? "active" : "not_active";

      const { statusStyle, statusText } = statusLabel(
        statusKey,
        userOrPartnerStatusStyles,
      );

      return (
        <span
          className={`px-2 py-1 rounded-sm text-xs font-semibold ${statusStyle}`}
        >
          <span className="capitalize">{statusText}</span>
        </span>
      );
    },
  },
];

const ManageUsersPage = () => {
  const [activeForm, setActiveForm] = useState<"none" | "user">("none");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/users");
      // Check Swagger: use res.data or res.data.data based on your API structure
      setUsers(res.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeForm === "none") {
      getUsers();
    }
  }, [getUsers, activeForm]);

  if (activeForm === "user") {
    return (
      <AddUserForm
        onBack={() => setActiveForm("none")}
        onCreated={() => setActiveForm("none")}
      />
    );
  }

  return (
    <section className="p-6">
      {/* Sticky Header with reduced padding for density */}
      <div className="sticky top-0 z-20 bg-white px-8 pt-2 pb-1">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Manage Users"
            description="All registered users for the various organizations"
          />

          <button
            type="button"
            onClick={() => setActiveForm("user")}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Internal Scroll container */}
      <div className="mt-2 overflow-y-auto rounded-lg border border-gray-200 bg-white max-h-[calc(100vh-200px)]">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Loading users...</div>
        ) : users.length > 0 ? (
          <DataTable data={users} columns={columns} />
        ) : (
          <div className="p-10 text-center text-gray-500">No users found.</div>
        )}
      </div>
    </section>
  );
};

export default ManageUsersPage;
