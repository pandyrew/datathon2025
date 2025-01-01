import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentWithDetails } from "@/app/lib/db/queries";
import RoleSelector from "@/app/components/RoleSelector";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  console.log("userId", userId);
  const studentData = await getStudentWithDetails(userId);
  const currentRole = studentData?.student.role || "participant";

  type Role = "participant" | "mentor" | "coordinator" | "judge";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-outfit font-light text-gray-900">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600 font-chillax">
              Welcome to your Datathon dashboard,{" "}
              {studentData?.application?.fullName ||
                studentData?.student.firstName}
            </p>
          </div>

          {/* Role Selector */}
          <RoleSelector currentRole={currentRole as Role} />

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application Status */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-outfit mb-4">Application Status</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                  <span className="text-gray-600 font-chillax">
                    Pending Review
                  </span>
                </div>
                <Link
                  href="/dashboard/application"
                  className="inline-block mt-2 text-indigo-600 hover:text-indigo-700 transition-colors font-chillax"
                >
                  View/Edit Application →
                </Link>
              </div>
            </div>

            {/* Team Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-outfit mb-4">Team Information</h2>
              <p className="text-gray-600 font-chillax">
                No team assigned yet. Join or create a team to get started.
              </p>
            </div>

            {/* Important Dates */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-outfit mb-4">Important Dates</h2>
              <div className="space-y-3 font-chillax">
                <div>
                  <p className="text-gray-900">Application Deadline</p>
                  <p className="text-gray-600">March 27, 2025</p>
                </div>
                <div>
                  <p className="text-gray-900">Event Start</p>
                  <p className="text-gray-600">April 11, 2025</p>
                </div>
                <div>
                  <p className="text-gray-900">Event End</p>
                  <p className="text-gray-600">April 13, 2025</p>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-outfit mb-4">Resources</h2>
              <div className="space-y-2 font-chillax">
                <a
                  href="#"
                  className="block text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  Participant Guide
                </a>
                <a
                  href="#"
                  className="block text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  Code of Conduct
                </a>
                <a
                  href="#"
                  className="block text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  Schedule
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Development Info Section */}
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            Development Information
          </h2>
          <pre className="bg-white p-4 rounded overflow-auto">
            {JSON.stringify(studentData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
