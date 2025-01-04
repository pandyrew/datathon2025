import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
// import { getStudentWithDetails } from "@/app/lib/db/queries";
import ApplicationSection from "@/app/components/admin/ApplicationSection";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Application, ApplicationType } from "@/app/types/application";
import { requireAdmin } from "@/app/lib/auth/adminCheck";

// Move mockApplications here or fetch real data
const mockApplications: Record<ApplicationType, Application[]> = {
  participant: [
    {
      id: "1",
      fullName: "John Doe",
      email: "john@uci.edu",
      status: "accepted",
      submittedAt: "2025-03-20",
    },
    {
      id: "2",
      fullName: "Jane Doe",
      email: "jane@uci.edu",
      status: "pending",
      submittedAt: "2025-03-20",
    },
    {
      id: "3",
      fullName: "John Doe",
      email: "john@uci.edu",
      status: "rejected",
      submittedAt: "2025-03-20",
    },
    {
      id: "4",
      fullName: "John Doe",
      email: "john@uci.edu",
      status: "pending",
      submittedAt: "2025-03-20",
    },
  ],
  mentor: [],
  judge: [],
  coordinator: [],
};

export default async function ApplicationTypePage({
  params,
}: {
  params: Promise<{ type: ApplicationType }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  await requireAdmin(userId);


  const resolvedParams = await params;
  const applications = mockApplications[resolvedParams.type];
  const typeTitle =
    resolvedParams.type.charAt(0).toUpperCase() + resolvedParams.type.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-chillax">Back to Admin Dashboard</span>
            </Link>
            <h1 className="text-3xl font-outfit font-light text-gray-900">
              {typeTitle} Applications
            </h1>
            <p className="mt-2 text-gray-600 font-chillax">
              Manage {resolvedParams.type} applications
            </p>
          </div>

          <ApplicationSection
            title={`${typeTitle} Applications`}
            description={`Review and manage ${resolvedParams.type} applications`}
            applications={applications}
            type={resolvedParams.type}
          />
        </div>
      </div>
    </div>
  );
}
