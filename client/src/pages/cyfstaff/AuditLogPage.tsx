import { useEffect, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { api } from "../../auth/authApi";

const tableHeaderStyle =
  "py-3 text-sm font-semibold text-[#333333] uppercase tracking-wide";

const ROWS_PER_PAGE = 30;

interface AuditEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAuditLog();
  }, [getAuditLog]);

  const totalPages = Math.max(1, Math.ceil(entries.length / ROWS_PER_PAGE));
  const start = (page - 1) * ROWS_PER_PAGE;
  const pageEntries = entries.slice(start, start + ROWS_PER_PAGE);

  return (
    <div className="audit-log">
      <div className="discovery-header flex justify-between mt-10 mb-8 mx-12">
        <div>
          <h2 className="text-3xl font-bold text-[#333333]">Audit Log</h2>
          <p className="text-sm text-slate-500 mt-2">
            Full history of status changes and actions across the system
          </p>
        </div>
      </div>

      <div className="mx-12">
        <div className="max-h-[70vh] overflow-y-auto border border-[#E3E3E3]">
          <table className="audit-log-table w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#F3F3F3]">
                <th className={`${tableHeaderStyle} pl-10`}>Entry ID</th>
                <th className={`${tableHeaderStyle} px-4`}>Timestamp</th>
                <th className={`${tableHeaderStyle} px-4`}>User</th>
                <th className={`${tableHeaderStyle} px-4`}>Action</th>
                <th className={`${tableHeaderStyle} px-4`}>Entity</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    Loading audit entries…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && entries.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    No audit entries yet.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[#F3F3F3] hover:bg-[#F3F3F3] transition-colors"
                  >
                    <td className="py-4 text-sm text-slate-500 pl-10">
                      {entry.id.slice(-5)}
                    </td>
                    <td className="py-4 text-sm text-slate-600 px-4">
                      {format(parseISO(entry.created_at), "yyyy-MM-dd HH:mm")}
                    </td>
                    <td className="py-4 text-sm text-slate-600 px-4">
                      {entry.user_email}
                    </td>
                    <td className="py-4 text-sm text-slate-600 px-4">
                      {entry.action}
                    </td>
                    <td className="py-4 text-sm text-slate-600 px-4">
                      {entry.entity_type} - {entry.entity_id.slice(-5)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
    </div>
  );
};

export default AuditLogPage;
