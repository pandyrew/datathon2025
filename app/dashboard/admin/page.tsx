import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  // getStudentWithDetails,
  getApplicationStats,
} from "@/app/lib/db/queries";
import Link from "next/link";
import { Users, UserCheck, Clock, XCircle } from "lucide-react";
import { requireAdmin } from "@/app/lib/auth/adminCheck";

function ApplicationCard({
  title,
  stats,
  href,
}: {
  title: string;
  stats: {
    total: number;
    submitted: number;
    accepted: number;
    rejected: number;
  };
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors"
    >
      <div className="p-6">
        <h2 className="text-xl font-outfit mb-4">{title}</h2>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm font-chillax">Total</span>
            </div>
            <p className="text-2xl font-outfit">{stats.total}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-chillax">Submitted</span>
            </div>
            <p className="text-2xl font-outfit">{stats.submitted}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-chillax">Rejected</span>
            </div>
            <p className="text-2xl font-outfit">{stats.rejected}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm font-chillax">Accepted</span>
            </div>
            <p className="text-2xl font-outfit">{stats.accepted}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  await requireAdmin(userId);

  // Get real stats from database
  const stats = await getApplicationStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-outfit font-light text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600 font-chillax">
              Overview of all applications
            </p>
          </div>

          {/* Application Cards */}
          <div className="grid grid-cols-1 gap-6">
            <ApplicationCard
              title="Participant Applications"
              stats={
                stats.participant as {
                  total: number;
                  submitted: number;
                  accepted: number;
                  rejected: number;
                }
              }
              href="/dashboard/admin/applications/participant"
            />

            <ApplicationCard
              title="Mentor Applications"
              stats={
                stats.mentor as {
                  total: number;
                  submitted: number;
                  accepted: number;
                  rejected: number;
                }
              }
              href="/dashboard/admin/applications/mentor"
            />

            <ApplicationCard
              title="Judge Applications"
              stats={
                stats.judge as {
                  total: number;
                  submitted: number;
                  accepted: number;
                  rejected: number;
                }
              }
              href="/dashboard/admin/applications/judge"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
