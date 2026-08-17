import { useState, useEffect, useCallback } from "react";
import { api } from "../../auth/authApi";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import type { TableColumn } from "../../components/DataTable";
import type { Organisation } from "../../data/dataType";
import AddPartnerForm from "./addPartner/AddPartnerForm";

const columns: TableColumn<Organisation>[] = [
  {
    header: "Organisation Name",

    accessor: "organisation_name",

    cellClassName: "font-bold text-[#333333]",
  },

  {
    header: "Location",

    accessor: "city",
  },

  {
    header: "Type",
    accessor: "type",
    render: (value) => {
      const val = String(value);
      if (val === "cyf_staff") return "CYF Staff";
      // Capitalize the first letter for others (e.g., "commercial" -> "Commercial")
      return val.charAt(0).toUpperCase() + val.slice(1);
    },
  },

  {
    header: "Email Domain",

    accessor: "email_domain",
  },

  {
    header: "Actions",

    accessor: "id",

    render: (id) => (
      <button
        onClick={() => console.log("Edit ID:", id)}

        className="text-blue-600 hover:underline"
      >
        View Details
      </button>
    ),
  },
];

const ManagePartnersPage = () => {
  const [activeForm, setActiveForm] = useState<"none" | "partner">("none");
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Use the useCallback pattern from your example
  const getOrganisations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/organisations");

      setOrganisations(res.data || []);
    } catch (error) {
      console.error("Error fetching organisations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeForm === "none") {
      getOrganisations();
    }
  }, [getOrganisations, activeForm]);

  if (activeForm === "partner") {
    return (
      <AddPartnerForm
        onBack={() => setActiveForm("none")}
        onCreated={() => setActiveForm("none")}
      />
    );
  }

  return (
    <section className="p-6">
      {/* Use PageHeader for a consistent look */}
      <div className="sticky top-0 z-20 bg-white px-8 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Manage Partners"
            description="All registered organizations."
          />
          <button
            onClick={() => setActiveForm("partner")}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Add Partner
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="p-10 text-center">Loading...</div>
        ) : (
          <DataTable data={organisations} columns={columns} />
        )}
      </div>
    </section>
  );
};

export default ManagePartnersPage;
