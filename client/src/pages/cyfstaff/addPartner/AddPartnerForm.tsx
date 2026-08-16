import { useState } from "react";
import type { AxiosError } from "axios";
import { api } from "../../../auth/authApi";

// The three organisation types stored in the DB. Labels are friendly;
// the values are what actually get submitted.
const ORG_TYPE_OPTIONS = [
  { value: "cyf_staff", label: "CYF Staff" },
  { value: "commercial", label: "Commercial" },
  { value: "outreach", label: "Outreach" },
];

type AddPartnerFormProps = {
  onBack: () => void; // return to the Manage Partners table (cancel)
  onCreated: () => void; // called after a successful create
};

type FormState = {
  organisation_name: string;
  type: string;
  email_domain: string;
  city: string;
};

const initialForm: FormState = {
  organisation_name: "",
  type: "",
  email_domain: "",
  city: "",
};

const AddPartnerForm = ({ onBack, onCreated }: AddPartnerFormProps) => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError(null);

    const { organisation_name, type, email_domain, city } = form;

    // All fields required
    if (
      !organisation_name.trim() ||
      !type ||
      !email_domain.trim() ||
      !city.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/addPartner", {
        organisation_name: organisation_name.trim(),
        type,
        email_domain: email_domain.trim(),
        city: city.trim(),
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
      <h1 className="text-2xl font-bold text-gray-900">Add Partner</h1>
      <p className="mt-1 text-sm text-gray-500">Create a new organisation.</p>

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
          {/* Organisation Name */}
          <div>
            <label htmlFor="organisation_name" className={labelClass}>
              Organisation Name
            </label>
            <input
              id="organisation_name"
              name="organisation_name"
              type="text"
              value={form.organisation_name}
              onChange={handleChange}
              placeholder="e.g. Deloitte"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="type" className={labelClass}>
              Type
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="" disabled>
                Select a type
              </option>
              {ORG_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email_domain" className={labelClass}>
              Email Domain
            </label>
            <input
              id="email_domain"
              name="email_domain"
              type="text"
              value={form.email_domain}
              onChange={handleChange}
              placeholder="e.g. deloitte.com"
              className={inputClass}
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className={labelClass}>
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. London"
              className={inputClass}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
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

export default AddPartnerForm;
