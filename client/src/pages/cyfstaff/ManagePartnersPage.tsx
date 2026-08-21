import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../auth/authApi";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import type { TableColumn } from "../../components/DataTable";
import type { Organisation } from "../../data/dataType";
import AddPartnerForm from "./addPartner/AddPartnerForm";

const columns: TableColumn<Organisation>[] = [
  {
    header: "ID",
    accessor: "id",
    cellClassName: "text-xs text-gray-600 font-mono",
    render: (value) => {
      const val = String(value);
      return val.slice(0, 5);
    },
  },
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
      return val.charAt(0).toUpperCase() + val.slice(1);
    },
  },
  {
    header: "Email Domain",
    accessor: "email_domain",
    render: (value) => value || "-",
  },
];

const ManagePartnersPage = () => {
  const [activeForm, setActiveForm] = useState<"none" | "partner">("none");
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Logic
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

  const filteredOrganisations = useMemo(() => {
    return organisations.filter((org) => {
      const search = searchTerm.toLowerCase();

      const name = (org.organisation_name || "").toLowerCase();
      const city = (org.city || "").toLowerCase();
      const type = (org.type || "").toLowerCase();
      const domain = (org.email_domain || "").toLowerCase();

      return (
        name.includes(search) ||
        city.includes(search) ||
        type.includes(search) ||
        domain.includes(search)
      );
    });
  }, [organisations, searchTerm]);

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
      <div className="sticky top-0 z-20 bg-white px-8 pt-2 pb-1">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Manage Partners"
            description="All registered organizations."
          />

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, location, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
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
              onClick={() => setActiveForm("partner")}
              className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Add Partner
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 overflow-y-auto rounded-lg border border-gray-200 bg-white max-h-[calc(100vh-150px)]">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">
            Loading partners...
          </div>
        ) : filteredOrganisations.length > 0 ? (
          <DataTable data={filteredOrganisations} columns={columns} />
        ) : (
          <div className="p-10 text-center text-gray-500">
            {searchTerm
              ? `No partners matching "${searchTerm}"`
              : "No partners found."}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManagePartnersPage;
