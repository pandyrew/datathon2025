import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getApplicationByStudentId } from "@/app/lib/db/queries";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/app/lib/auth/adminCheck";
import { ApplicationType, Application } from "@/app/types/application";
import { formatDate } from "@/app/lib/utils/formatDate";
import {
  ParticipantApplication,
  JudgeApplication,
  MentorApplication,
} from "@/app/types/application";
import RatingSystem from "@/app/components/admin/RatingSystem";

function ApplicationRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 py-4 px-4 border-b border-gray-200 hover:bg-gray-50">
      <div className="sm:col-span-1 font-medium text-gray-500 pb-1 sm:mb-0 font-outfit">
        {label}
      </div>
      <div className="sm:col-span-2 text-gray-900 font-outfit">
        {typeof value === "boolean"
          ? value
            ? "Yes"
            : "No"
          : value === null || value === ""
          ? "Not specified"
          : typeof value === "object"
          ? JSON.stringify(value)
          : String(value)}
      </div>
    </div>
  );
}

function ApplicationDetails({
  application,
}: {
  application: ParticipantApplication | JudgeApplication | MentorApplication;
}) {
  const excludedFields = ["id", "studentId"];

  // Adjust primary fields based on application type
  const getPrimaryFields = () => {
    const commonFields = ["fullName", "university", "major", "educationLevel"];

    if ("isFirstDatathon" in application) {
      // Fields specific to ParticipantApplication
      return [
        ...commonFields,
        "developmentGoals",
        "comfortLevel",
        "isFirstDatathon",
        "hasTeam",
      ];
    } else if ("mentorshipAreas" in application) {
      // Fields specific to MentorApplication
      return [
        ...commonFields,
        "mentorshipAreas",
        "previousMentorshipExperience",
      ];
    } else {
      // Fields specific to JudgeApplication
      return [...commonFields, "judgeExperience"];
    }
  };

  const primaryFields = getPrimaryFields();

  const fieldLabels: Record<string, string> = {
    fullName: "Full Name",
    createdAt: "Submitted At",
    updatedAt: "Last Updated",
    isFirstDatathon: "First Datathon",
    comfortLevel: "Technical Comfort Level",
    hasTeam: "Has Team",
    educationLevel: "Year of Study",
    attendanceConfirmed: "Attendance Confirmed",
    dietaryRestrictions: "Dietary Restrictions",
    developmentGoals: "Development Goals",
    githubUrl: "GitHub Profile",
    linkedinUrl: "LinkedIn Profile",
  };

  const formatValue = (key: string, value: unknown) => {
    if (key === "createdAt" || key === "updatedAt") {
      return formatDate(value as string);
    }
    if (key === "comfortLevel") {
      return `${value as number}/5`;
    }
    return value;
  };

  const renderFields = (fields: string[]) => {
    return fields.map(
      (key) =>
        application[key as keyof Application] && (
          <ApplicationRow
            key={key}
            label={
              fieldLabels[key] ||
              key.charAt(0).toUpperCase() +
                key.slice(1).replace(/([A-Z])/g, " $1")
            }
            value={formatValue(key, application[key as keyof Application])}
          />
        )
    );
  };

  const secondaryFields = Object.keys(application).filter(
    (key) => !excludedFields.includes(key) && !primaryFields.includes(key)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-outfit font-medium text-gray-900 mb-4">
          Primary Information
        </h2>
        <div className="space-y-0">{renderFields(primaryFields)}</div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-outfit font-medium text-gray-900 mb-4">
          Additional Information
        </h2>
        <div className="space-y-0">{renderFields(secondaryFields)}</div>
      </div>
    </div>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const resolvedParams = await params;
  const { userId } = await auth();
  if (!userId) redirect("/");
  await requireAdmin(userId);

  const isValidType = (type: string): type is ApplicationType => {
    return ["participant", "mentor", "judge"].includes(type);
  };

  if (!isValidType(resolvedParams.type)) {
    redirect("/dashboard/admin");
  }
  console.log("resolvedParams", resolvedParams);
  const application = await getApplicationByStudentId(
    resolvedParams.id,
    resolvedParams.type
  );
  console.log("application", application);
  if (!application) {
    redirect(`/dashboard/admin/applications/${resolvedParams.type}`);
  }

  const typeTitle =
    resolvedParams.type.charAt(0).toUpperCase() + resolvedParams.type.slice(1);

  const typedApplication = application as unknown as Application;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
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
            <h1 className="text-3xl font-outfit font-light text-gray-900">
              {typeTitle} Application Details
            </h1>
          </div>

          {typedApplication && (
            <ApplicationDetails application={typedApplication} />
          )}

          <RatingSystem
            applicationId={typedApplication.id}
            applicationRole={resolvedParams.type}
          />
        </div>
      </div>
    </div>
  );
}
