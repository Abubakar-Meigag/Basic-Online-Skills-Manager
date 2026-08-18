import { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemo
import { api } from "../../auth/authApi";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import type { TableColumn } from "../../components/DataTable";
import type { User } from "../../data/dataType";
import AddUserForm from "./addPartner/AddUserForm";
import statusLabel from "../../utils/statusLabel";
import { userOrPartnerStatusStyles } from "../../lib/constants/userOrPartnerStatusStyles";

const ManageUsersPage = () => {
  const [activeForm, setActiveForm] = useState<"none" | "user">("none");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();

      const orgName = (user.organisation_name || "N/A").toLowerCase();
      const emailName = (user.email || "N/A").toLowerCase();
      const statusText = user.is_active ? "active" : "Inactive";

      return (
        orgName.includes(search) ||
        emailName.includes(search) ||
        statusText.includes(search)
      );
    });
  }, [users, searchTerm]);

  // Fetch Users Logic
  const getUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update Status Logic
  const handleStatusChange = useCallback(
    async (userId: string, newStatus: boolean) => {
      try {
        // Send the patch request to the backend
        await api.patch(`/users/${userId}/status`, { is_active: newStatus });

        // Refresh the list from the server to ensure the UI matches the DB
        getUsers();
      } catch (error) {
        console.error("Failed to update status:", error);
        alert("Could not update user status. Please try again.");
      }
    },
    [getUsers],
  );

  // Columns Definition (Memoized)
  const columns = useMemo(
    (): TableColumn<User>[] => [
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
        render: (isActive, row) => {
          const statusKey = isActive ? "active" : "not_active";
          const { statusStyle } = statusLabel(
            statusKey,
            userOrPartnerStatusStyles,
          );

          return (
            <select
              value={statusKey}
              onChange={(e) =>
                handleStatusChange(row.id, e.target.value === "active")
              }
              className={`cursor-pointer rounded-sm px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 ${statusStyle}`}
            >
              <option value="active">Active</option>
              <option value="not_active">Inactive</option>
            </select>
          );
        },
      },
    ],
    [handleStatusChange],
  ); // Only re-calculate if handleStatusChange changes

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
      <div className="sticky top-0 z-20 bg-white px-8 pt-2 pb-1">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Manage Users"
            description="All registered users for the various organizations"
          />

          {/* Wrap the search input and button in a flex container */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by org, email or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {/* Clear button appears only when there is text */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveForm("user")}
              className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Add User
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 overflow-y-auto rounded-lg border border-gray-200 bg-white max-h-[calc(100vh-200px)]">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          <DataTable data={filteredUsers} columns={columns} />
        ) : (
          /* show a different message if a search is active */
          <div className="p-10 text-center text-gray-500">
            {searchTerm
              ? `No users matching "${searchTerm}"`
              : "No users found."}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageUsersPage;
