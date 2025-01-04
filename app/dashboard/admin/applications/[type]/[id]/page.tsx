import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStudentWithDetails } from "@/app/lib/db/queries";
import Link from "next/link";
import { ChevronLeft, Clock, Mail, User, Calendar, School } from "lucide-react";
import { requireAdmin } from "@/app/lib/auth/adminCheck";

type ApplicationType = "participant" | "mentor" | "judge" | "coordinator";

// Mock data - replace with actual data fetching
const mockApplications = {
  participant: [
    {
      id: "1",
      fullName: "John Doe",
      email: "john@uci.edu",
      status: "accepted",
      submittedAt: "2025-03-20",
      // Additional fields
      major: "Computer Science",
      year: "Junior",
      experience: "I have experience in Python and JavaScript...",
      whyJoin: "I want to learn more about data science...",
      linkedIn: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      resume: "https://example.com/resume.pdf",
      dietaryRestrictions: "Vegetarian",
      shirtSize: "M",
    },
    {
      id: "2",
      fullName: "Jane Doe",
      email: "jane@uci.edu",
      status: "draft",
      submittedAt: "2025-03-20",
      // Additional fields
      major: "Computer Science",
      year: "Junior",
      experience: "I have experience in Python and JavaScript...",
      whyJoin: "I want to learn more about data science...",
      linkedIn: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      resume: "https://example.com/resume.pdf",
      dietaryRestrictions: "Vegetarian",
      shirtSize: "M",
    },
  ],
  mentor: [
    /* ... */
  ],
  judge: [
    /* ... */
  ],
  coordinator: [
    /* ... */
  ],
} as const;

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Type guard to ensure type is valid
  const isValidType = (type: string): type is ApplicationType => {
    return ["participant", "mentor", "judge", "coordinator"].includes(type);
  };

  if (!isValidType(resolvedParams.type)) {
    redirect("/dashboard/admin");
  }

  const { userId } = await auth();
  if (!userId) redirect("/");

  // Replace the manual check with requireAdmin
  await requireAdmin(userId);

  console.log(resolvedSearchParams);

  // Find the application
  const application = mockApplications[resolvedParams.type]?.find(
    (app) => app.id === resolvedParams.id
  );

  if (!application) {
    redirect(`/dashboard/admin/applications/${resolvedParams.type}`);
  }

  const typeTitle =
    resolvedParams.type.charAt(0).toUpperCase() + resolvedParams.type.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <Link
              href={`/dashboard/admin/applications/${resolvedParams.type}`}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-chillax">
                Back to {typeTitle} Applications
              </span>
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-outfit font-light text-gray-900">
                  Application Details
                </h1>
                <p className="mt-2 text-gray-600 font-chillax">
                  Review application for {application.fullName}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-chillax ${
                  application.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : application.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {application.status.charAt(0).toUpperCase() +
                  application.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Application Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-outfit mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-chillax text-gray-900">
                      {application.fullName}
                    </p>
                    <p className="text-sm text-gray-600">Full Name</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-chillax text-gray-900">
                      {application.email}
                    </p>
                    <p className="text-sm text-gray-600">Email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <School className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-chillax text-gray-900">
                      {application.major}
                    </p>
                    <p className="text-sm text-gray-600">Major</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-chillax text-gray-900">
                      {application.year}
                    </p>
                    <p className="text-sm text-gray-600">Year</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-chillax text-gray-900">
                      {application.submittedAt}
                    </p>
                    <p className="text-sm text-gray-600">Submitted At</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-outfit mb-4">
                Additional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-chillax text-gray-900">Experience</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {application.experience}
                  </p>
                </div>
                <div>
                  <p className="font-chillax text-gray-900">Why Join?</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {application.whyJoin}
                  </p>
                </div>
              </div>
            </div>

            {/* Links & Documents */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-outfit mb-4">Links & Documents</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-chillax text-gray-900">LinkedIn</p>
                  <a
                    href={application.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {application.linkedIn}
                  </a>
                </div>
                <div>
                  <p className="font-chillax text-gray-900">GitHub</p>
                  <a
                    href={application.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {application.github}
                  </a>
                </div>
                <div>
                  <p className="font-chillax text-gray-900">Resume</p>
                  <a
                    href={application.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-outfit mb-4">Event Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-chillax text-gray-900">
                    Dietary Restrictions
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {application.dietaryRestrictions || "None"}
                  </p>
                </div>
                <div>
                  <p className="font-chillax text-gray-900">T-Shirt Size</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {application.shirtSize}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-chillax">
              Accept Application
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-chillax">
              Reject Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
