import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - PMS",
  description: "Project Management System Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage your projects
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Track and update your tasks
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Team</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your team members
          </p>
        </div>
      </div>
    </div>
  );
} 