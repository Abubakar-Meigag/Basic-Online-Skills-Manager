import { useState } from "react";
import AddPartnerForm from "./addPartner/AddPartnerForm";
import AddUserForm from "./addPartner/AddUserForm";

type ActiveForm = "none" | "partner" | "user";

const ManageUsersPage = () => {
  const [activeForm, setActiveForm] = useState<ActiveForm>("none");

  // Return to the table (cancel).
  const handleBack = () => {
    setActiveForm("none");
  };

  // After a successful create: leave the form and return to the table.
  const handleCreated = () => {
    setActiveForm("none");
  };

  if (activeForm === "partner") {
    return <AddPartnerForm onBack={handleBack} onCreated={handleCreated} />;
  }

  if (activeForm === "user") {
    return <AddUserForm onBack={handleBack} onCreated={handleCreated} />;
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#333333]">Manage Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            All registered users for the various Organizations
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveForm("partner")}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Add Partner
          </button>
          <button
            type="button"
            onClick={() => setActiveForm("user")}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add User
          </button>
        </div>
      </div>

      {/* The partners table goes here (existing / to be added). */}
    </div>
  );
};

export default ManageUsersPage;
