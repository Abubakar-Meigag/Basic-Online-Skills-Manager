import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../auth/authApi";
import type { AxiosError } from "axios";

const DASHBOARD_ROUTE = "/commercial-partner/requested-courses";

type FormState = {
  account_name: string;
  contract_name: string;
  city: string;
  trainee_target: string;
  deadline: string;
};

const initialForm: FormState = {
  account_name: "",
  contract_name: "",
  city: "",
  trainee_target: "",
  deadline: "",
};

const RequestNewCourse = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError(null);

    const { account_name, contract_name, city, trainee_target, deadline } =
      form;

    if (
      !account_name.trim() ||
      !contract_name.trim() ||
      !city.trim() ||
      !trainee_target ||
      !deadline
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const target = Number(trainee_target);
    if (!Number.isInteger(target) || target <= 0) {
      setError("Trainee target must be a positive whole number.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/commercial/requestedNewCourses`, {
        account_name: account_name.trim(),
        contract_name: contract_name.trim(),
        city: city.trim(),
        trainee_target: target,
        deadline, // YYYY-MM-DD
      });

      // go back to the dashboard
      navigate(DASHBOARD_ROUTE);
    } catch (err) {
      const axiosErr = err as AxiosError<{
        message?: string;
        error?: string;
        redirectRoute?: string;
      }>;

      const data = axiosErr.response?.data;

      // Middleware sends redirectRoute on auth failures (401/403)
      if ((axiosErr.response?.status === 401 || axiosErr.response?.status === 403) && data?.redirectRoute) {
        navigate(data.redirectRoute);
        return;
      }
      const message =
        data?.message ??
        data?.error ??
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    navigate(DASHBOARD_ROUTE);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <button
          type="button"
          onClick={handleCancel}
          className="mb-4 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Request New Course</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete the form below to submit a new training course request.
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
              <label
                htmlFor="account_name"
                className="block text-sm font-medium text-gray-700"
              >
                Account
              </label>
              <input
                id="account_name"
                name="account_name"
                type="text"
                value={form.account_name}
                onChange={handleChange}
                placeholder="e.g. National Highways"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="contract_name"
                className="block text-sm font-medium text-gray-700"
              >
                Contract
              </label>
              <input
                id="contract_name"
                name="contract_name"
                type="text"
                value={form.contract_name}
                onChange={handleChange}
                placeholder="e.g. Enterprise Skills Agreement 2026"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Birmingham"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="trainee_target"
                className="block text-sm font-medium text-gray-700"
              >
                Trainee Target
              </label>
              <input
                id="trainee_target"
                name="trainee_target"
                type="number"
                min="1"
                step="1"
                value={form.trainee_target}
                onChange={handleChange}
                placeholder="e.g. 20"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-gray-700"
              >
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestNewCourse;
