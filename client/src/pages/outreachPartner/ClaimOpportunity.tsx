import { useState } from "react";
import { parseISO, format, addDays } from "date-fns";
import type { AxiosError } from "axios";
import { api } from "../../auth/authApi";
import type { Course } from "../../data/dataType";

// Fixed course duration for a Basic Online Skills course.
const COURSE_DURATION_DAYS = 21; // 3 weeks
const COURSE_TITLE = "Basic Online Skills";
const COURSE_DURATION_LABEL = "3 weeks";

type ClaimOpportunityProps = {
  course: Course;
  onBack: () => void; // return to the board (cancel)
  onClaimed: () => void; // called after a successful claim
};

type FormState = {
  contact_name: string;
  contact_email: string;
  venue_address: string;
  start_date: string; // YYYY-MM-DD
  lunch_arrangement: string;
  client_group_description: string;
  tech_level: string;
  goal: string;
  expenses_notes: string;
  note: string;
};

const initialForm: FormState = {
  contact_name: "",
  contact_email: "",
  venue_address: "",
  start_date: "",
  lunch_arrangement: "",
  client_group_description: "",
  tech_level: "",
  goal: "",
  expenses_notes: "",
  note: "",
};

const ClaimOpportunity = ({
  course,
  onBack,
  onClaimed,
}: ClaimOpportunityProps) => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculated end date preview (start + 3 weeks). Display only
  // the backend sets the stored end_date, so this is never sent.
  const calculatedEndDate = form.start_date
    ? format(
        addDays(parseISO(form.start_date), COURSE_DURATION_DAYS),
        "dd/MM/yyyy",
      )
    : null;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError(null);

    const {
      contact_name,
      contact_email,
      venue_address,
      start_date,
      lunch_arrangement,
    } = form;

    // Required fields
    if (
      !contact_name.trim() ||
      !contact_email.trim() ||
      !venue_address.trim() ||
      !start_date ||
      !lunch_arrangement.trim()
    ) {
      setError(
        "Please fill in all required fields: contact name, contact email, venue address, start date, and lunch arrangement.",
      );
      return;
    }

    // Basic email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(contact_email.trim())) {
      setError("Please enter a valid contact email address.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/courses/${course.id}/claim`, {
        contact_name: contact_name.trim(),
        contact_email: contact_email.trim(),
        venue_address: venue_address.trim(),
        start_date,
        lunch_arrangement: lunch_arrangement.trim(),
        client_group_description: form.client_group_description.trim(),
        tech_level: form.tech_level.trim(),
        goal: form.goal.trim(),
        expenses_notes: form.expenses_notes.trim(),
        note: form.note.trim(),
      });

      onClaimed();
    } catch (err) {
      const axiosErr = err as AxiosError<{
        message?: string;
        error?: string;
        redirectRoute?: string;
      }>;
      const data = axiosErr.response?.data;
      const status = axiosErr.response?.status;

      if (status === 409) {
        setError(
          "This opportunity has already been claimed and is no longer available.",
        );
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

  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
      >
        ← Opportunity Board
      </button>
      <h1 className="text-2xl font-bold text-gray-900">Claim This Course</h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Original Request
          </span>
          <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
            ● OPEN
          </span>
        </div>

        <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2">
          <SummaryItem
            label="Commercial Partner"
            value={course.commercial_org}
          />
          <SummaryItem label="Course Title" value={COURSE_TITLE} />
          <SummaryItem label="City" value={course.city} />
          <SummaryItem
            label="Trainee Target"
            value={String(course.trainee_target)}
          />
          <SummaryItem label="Duration" value={COURSE_DURATION_LABEL} />
          <SummaryItem
            label="Claim Deadline"
            value={format(parseISO(course.deadline), "dd MMM yyyy")}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-lg border border-gray-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          Your Hosting Details
        </h2>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="contact_name" className={labelClass}>
              Main Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              id="contact_name"
              name="contact_name"
              type="text"
              value={form.contact_name}
              onChange={handleChange}
              placeholder="e.g. Sarah Johnson"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact_email" className={labelClass}>
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              value={form.contact_email}
              onChange={handleChange}
              placeholder="e.g. sarah@newbeginnings.org"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="venue_address" className={labelClass}>
              Venue Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="venue_address"
              name="venue_address"
              rows={2}
              value={form.venue_address}
              onChange={handleChange}
              placeholder="e.g. 14 Civic Square, Floor 2, London, EC1A 1BB"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="start_date" className={labelClass}>
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
            <span className="text-xs font-semibold  tracking-wide text-gray-500">
              Automation shows up after choosing Start Date
            </span>
            <p className="mt-1 text-sm text-gray-600">
              End Date:{" "}
              <span className="font-medium text-gray-900">
                {calculatedEndDate ?? " "}
              </span>
            </p>
          </div>

          <div>
            <label htmlFor="lunch_arrangement" className={labelClass}>
              Lunch Arrangement <span className="text-red-500">*</span>
            </label>
            <input
              id="lunch_arrangement"
              name="lunch_arrangement"
              type="text"
              value={form.lunch_arrangement}
              onChange={handleChange}
              placeholder="e.g. Provided on site"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="client_group_description" className={labelClass}>
              Client Group Description
            </label>
            <input
              id="client_group_description"
              name="client_group_description"
              type="text"
              value={form.client_group_description}
              onChange={handleChange}
              placeholder="Optional"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="tech_level" className={labelClass}>
              Tech Level
            </label>
            <input
              id="tech_level"
              name="tech_level"
              type="text"
              value={form.tech_level}
              onChange={handleChange}
              placeholder="Optional"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="goal" className={labelClass}>
              Goal
            </label>
            <input
              id="goal"
              name="goal"
              type="text"
              value={form.goal}
              onChange={handleChange}
              placeholder="Optional"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="expenses_notes" className={labelClass}>
              Expenses Notes
            </label>
            <input
              id="expenses_notes"
              name="expenses_notes"
              type="text"
              value={form.expenses_notes}
              onChange={handleChange}
              placeholder="Optional"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="note" className={labelClass}>
              Note
            </label>
            <textarea
              id="note"
              name="note"
              rows={2}
              value={form.note}
              onChange={handleChange}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Claiming…" : "Claim This Opportunity"}
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

// Small read-only label/value pair for the summary grid.
const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-base text-gray-900">{value}</p>
  </div>
);

export default ClaimOpportunity;
