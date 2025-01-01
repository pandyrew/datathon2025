import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { updateApplicationData, submitApplication } from "@/app/lib/actions";

type StudentData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  application: {
    id: string;
    status: string;
    fullName?: string;
    university?: string;
    major?: string;
    educationLevel?: string;
    expertise?: string;
    availability?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    feedback?: string;
  };
};

export default function MentorApplication() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    async function fetchStudentData() {
      if (user?.id) {
        try {
          const response = await fetch(`/api/students/${user.id}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setStudentData(data);
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      }
    }
    fetchStudentData();
  }, [user?.id]);

  if (isLoaded && !user) {
    redirect("/");
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Verify the user's role
  if (studentData.student.role !== "mentor") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You must be a mentor to access this application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-outfit font-light text-gray-900">
              Mentor Application
            </h1>
            <p className="mt-2 text-gray-600 font-chillax">
              Share your expertise to help guide participants
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <form
              action={async (formData: FormData) => {
                try {
                  const result = await updateApplicationData(
                    studentData.application.id,
                    "mentor",
                    formData
                  );

                  if (!result.success) {
                    console.error("Failed to save application:", result.error);
                    return;
                  }

                  await submitApplication(studentData.student.id);
                  router.push("/dashboard");
                } catch (error) {
                  console.error("Form submission error:", error);
                }
              }}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 font-chillax"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  defaultValue={
                    studentData.application.fullName ||
                    `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="university"
                  className="block text-sm font-medium text-gray-700 font-chillax"
                >
                  University/Organization *
                </label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  defaultValue={studentData.application.university || ""}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="expertise"
                  className="block text-sm font-medium text-gray-700 font-chillax"
                >
                  Areas of Expertise *
                </label>
                <textarea
                  id="expertise"
                  name="expertise"
                  rows={4}
                  defaultValue={studentData.application.expertise || ""}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                  placeholder="Please list your areas of expertise in data science, machine learning, or related fields"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="availability"
                  className="block text-sm font-medium text-gray-700 font-chillax"
                >
                  Availability During Event *
                </label>
                <textarea
                  id="availability"
                  name="availability"
                  rows={3}
                  defaultValue={studentData.application.availability || ""}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                  placeholder="Please indicate your availability during April 11th-13th"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="linkedin"
                  className="block text-sm font-medium text-gray-700 font-chillax"
                >
                  LinkedIn URL *
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  defaultValue={studentData.application.linkedinUrl || ""}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="github"
                  className="block text-sm font-medium text-gray-700 font-chillax"
                >
                  Github URL
                </label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  defaultValue={studentData.application.githubUrl || ""}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                />
              </div>

              <div>
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium text-gray-700 font-chillax"
                >
                  Additional Comments
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  rows={3}
                  defaultValue={studentData.application.feedback || ""}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-chillax"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
