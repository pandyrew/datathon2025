import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getApplicationsByTypeAndStatus,
  ApplicationListItem,
} from "@/app/lib/db/queries";
import ApplicationSection from "@/app/components/admin/ApplicationSection";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ApplicationType, Application } from "@/app/types/application";
import { requireAdmin } from "@/app/lib/auth/adminCheck";

export default async function ApplicationTypePage({
  params,
}: {
  params: Promise<{ type: ApplicationType }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  await requireAdmin(userId);

  const resolvedParams = await params;
  const applications = await getApplicationsByTypeAndStatus(
    resolvedParams.type
  );

  // Convert ApplicationListItem[] to Application[]
  const typedApplications = applications.map((app: ApplicationListItem) => ({
    ...app,
    studentId: app.id, // Using id as studentId since it's required
    updatedAt: app.submittedAt.toISOString(), // Using submittedAt as updatedAt
    createdAt: app.submittedAt.toISOString(), // Using submittedAt as createdAt
  })) as unknown as Application[];

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
            applications={typedApplications}
            type={resolvedParams.type}
          />
        </div>
      </div>
    </div>
  );
}
