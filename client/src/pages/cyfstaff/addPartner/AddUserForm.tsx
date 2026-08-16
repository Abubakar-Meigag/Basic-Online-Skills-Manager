import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { api } from "../../../auth/authApi";

type Organisation = {
  id: string;
  organisation_name: string;
  type: string;
};

type AddUserFormProps = {
  onBack: () => void; // return to the Manage Partners table (cancel)
  onCreated: () => void; // called after a user is successfully created
};

const AddUserForm = ({ onBack, onCreated }: AddUserFormProps) => {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [orgId, setOrgId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch the list of organisations for the dropdown on mount.
  useEffect(() => {
    const loadOrganisations = async () => {
      try {
        const res = await api.get("/organisations");
        setOrganisations(res.data);
      } catch {
        setError("Could not load organisations. Please try again.");
      } finally {
        setLoadingOrgs(false);
      }
    };
    loadOrganisations();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Both fields required
    if (!orgId) {
      setError("Please select an organisation.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter an email.");
      return;
    }

    // Basic email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/partners/${orgId}/users`, {
        email: email.trim(),
      });

      onCreated();
    } catch (err) {
      const axiosErr = err as AxiosError<{
        message?: string;
        error?: string;
        redirectRoute?: string;
      }>;
      const data = axiosErr.response?.data;
      const message =
        data?.message ??
        data?.error ??
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Manage Partners
      </button>
      <h1 className="text-2xl font-bold text-gray-900">Add User</h1>
      <p className="mt-1 text-sm text-gray-500">
        Add a login user to an existing organisation.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-lg border border-gray-200 bg-white p-6"
      >
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="organisation" className={labelClass}>
              Organisation
            </label>
            <select
              id="organisation"
              name="organisation"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              disabled={loadingOrgs}
              className={inputClass}
            >
              <option value="" disabled>
                {loadingOrgs
                  ? "Loading organisations…"
                  : "Select an organisation"}
              </option>
              {organisations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.organisation_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. second.user@capgemini.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={submitting || loadingOrgs}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
