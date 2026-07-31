import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-[25px] justify-center items-center flex-grow min-h-screen">
      <section className="text-center">
        <h1 className="text-3xl font-bold">Basic Online Skills Manager</h1>
        <p className="text-gray-600 mt-2">This is a simple CRM application.</p>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Test Dashboard Links</h2>
        <p className="text-gray-600 mb-6">
          (Temporary testing - Click a link to go to the corresponding dashboard)
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard/cyf-staff"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            CYF Staff Dashboard
          </Link>
          <Link
            to="/dashboard/commercial-partner"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Commercial Partner Dashboard
          </Link>
          <Link
            to="/dashboard/outreach-partner"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Outreach Partner Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
