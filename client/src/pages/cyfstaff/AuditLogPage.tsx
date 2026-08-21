import { useEffect, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { api } from "../../auth/authApi";
import PageHeader from "../../components/PageHeader";
import DataTable, { type TableColumn } from "../../components/DataTable";

const ROWS_PER_PAGE = 30;

type AuditEntry = {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
};

const columns: TableColumn<AuditEntry>[] = [
  {
    header: "Entry ID",
    accessor: "id",
    headerClassName: "text-center pr-10",
    cellClassName: "text-center text-slate-600 font-mono pr-10",
    render: (val) => String(val).slice(0, 5),
  },
  {
    header: "Timestamp",
    accessor: "created_at",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
    render: (val) => format(parseISO(String(val)), "yyyy-MM-dd HH:mm"),
  },
  {
    header: "User",
    accessor: "user_email",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
  },
  {
    header: "Action",
    accessor: "action",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
    render: (val) => {
      const cleanText = String(val).replace(/[._]/g, " ");
      return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
    },
  },
  {
    header: "Entity",
    accessor: "entity_id",
    headerClassName: "text-center",
    cellClassName: "text-center text-slate-600",
    render: (_, row) => `${row.entity_type} - ${row.entity_id.slice(0, 5)}`,
  },
];

const AuditLogPage = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const getAuditLog = useCallback(async () => {
    try {
      const res = await api.get("/audit-log");
      setEntries(res.data);
    } catch (error) {
      console.error("Authorization failed fetching audit log:", error);
      setError("Could not load the audit log. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAuditLog();
  }, [getAuditLog]);

  const totalPages = Math.max(1, Math.ceil(entries.length / ROWS_PER_PAGE));
  const start = (page - 1) * ROWS_PER_PAGE;
  const pageEntries = entries.slice(start, start + ROWS_PER_PAGE);

  return (
    <section className="p-6">
      <div className="sticky top-0 z-20 bg-white pt-2 px-12">
        <PageHeader
          title="Audit Log"
          description="Full history of status changes and actions across the system"
        />
      </div>

      <div className="mx-12">
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto border border-[#E3E3E3] mt-2">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Loading audit entries…
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-red-600">{error}</div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No audit entries yet.
            </div>
          ) : (
            <DataTable<AuditEntry> data={pageEntries} columns={columns} />
          )}
        </div>

        {!loading && !error && entries.length > 0 && (
          <div className="flex items-center justify-between mt-4 mb-10 text-sm text-slate-600">
            <span>
              Showing {start + 1}–
              {Math.min(start + ROWS_PER_PAGE, entries.length)} of{" "}
              {entries.length}
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AuditLogPage;
