import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Application, ApplicationType } from "@/app/types/application";

interface ApplicationSectionProps {
  title: string;
  description: string;
  applications: Application[];
  type: ApplicationType;
}

export default function ApplicationSection({
  title,
  description,
  applications,
  type,
}: ApplicationSectionProps) {
  // Calculate statistics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(
    (app) => app.status === "pending"
  ).length;
  const acceptedApplications = applications.filter(
    (app) => app.status === "accepted"
  ).length;
  const rejectedApplications = applications.filter(
    (app) => app.status === "rejected"
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6">
        <h2 className="text-xl font-outfit mb-2">{title}</h2>
        <p className="text-gray-600 font-chillax mb-6">{description}</p>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 font-chillax">Total</p>
            <p className="text-2xl font-outfit">{totalApplications}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 font-chillax">Pending</p>
            <p className="text-2xl font-outfit">{pendingApplications}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-chillax">Rejected</p>
            <p className="text-2xl font-outfit">{rejectedApplications}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-chillax">Accepted</p>
            <p className="text-2xl font-outfit">{acceptedApplications}</p>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-2">
          {applications.length > 0 ? (
            applications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-chillax text-gray-900">
                    {application.fullName}
                  </p>
                  <p className="text-sm text-gray-600">{application.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-chillax ${
                      application.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : application.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {application.status}
                  </span>
                  <Link
                    href={`/dashboard/admin/applications/${type}/${application.id}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 font-chillax">
                No applications received yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
