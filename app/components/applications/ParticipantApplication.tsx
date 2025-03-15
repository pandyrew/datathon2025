"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { updateApplicationData, submitApplication } from "@/app/lib/actions";
import LoadingSpinner from "./components/LoadingSpinner";
import WelcomeStep from "./components/ParticipantWelcome";

type StudentData = {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  application: {
    id: string;
    status: string;
    full_name?: string;
    gender?: string;
    pronouns?: string;
    pronouns_other?: string;
    university?: string;
    major?: string;
    education_level?: string;
    is_first_datathon?: boolean;
    comfort_level?: number;
    has_team?: boolean;
    teammates?: string;
    dietary_restrictions?: string;
    development_goals?: string;
    github_url?: string;
    linkedin_url?: string;
    attendance_confirmed?: boolean;
    feedback?: string;
  };
  team?: {
    id: string;
    name: string;
  };
};

async function saveAndContinue(
  formData: FormData,
  applicationId: string,
  currentStep: number,
  setCurrentStep: (step: number) => void
) {
  try {
    // Save current step data
    const result = await updateApplicationData(
      applicationId,
      currentStep.toString(),
      formData
    );

    if (!result.success) {
      console.error("Failed to save step:", result.error);
      return;
    }

    console.log("Successfully saved step:", currentStep);
    // Move to next step
    setCurrentStep(currentStep + 1);
  } catch (error) {
    console.error("Error saving step:", error);
  }
}

export default function ParticipantApplication() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [showPronounsOther, setShowPronounsOther] = useState(false);
  const totalSteps = 4;

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
          setShowPronounsOther(data?.application?.pronouns === "other");
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
    return <LoadingSpinner />;
  }

  // Verify the user's role
  if (studentData.student.role !== "participant") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You must be a participant to access this application.
          </p>
        </div>
      </div>
    );
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div>
            {currentStep > 0 && (
              <>
                <h1 className="text-3xl font-outfit font-light text-gray-900">
                  Datathon Application
                </h1>
                <p className="mt-2 text-gray-600 font-chillax">
                  Please fill out all required fields below
                </p>
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`text-sm font-chillax ${
                          step === currentStep
                            ? "text-indigo-600"
                            : "text-gray-500"
                        }`}
                      >
                        Step {step}
                      </span>
                    ))}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentStep - 1) / 2) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Application Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <form
              action={async (formData: FormData) => {
                if (currentStep < totalSteps - 1) {
                  // Save and continue to next step
                  await saveAndContinue(
                    formData,
                    studentData.application.id,
                    currentStep,
                    setCurrentStep
                  );
                } else {
                  // Final submission
                  try {
                    // First save the final step
                    const saveResult = await updateApplicationData(
                      studentData.application.id,
                      currentStep.toString(),
                      formData
                    );

                    if (!saveResult.success) {
                      console.error(
                        "Failed to save final step:",
                        saveResult.error
                      );
                      return;
                    }

                    // Add a small delay to ensure the save completes
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    // Then submit the application
                    const submitResult = await submitApplication(
                      studentData.student.id
                    );

                    if (!submitResult.success) {
                      console.error(
                        "Failed to submit application:",
                        submitResult.error
                      );
                      return;
                    }

                    console.log(
                      "Application submitted successfully:",
                      submitResult.data
                    );

                    // Add another small delay before redirecting
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    router.push("/dashboard");
                  } catch (error) {
                    console.error("Form submission error:", error);
                  }
                }
              }}
            >
              {currentStep === 0 ? (
                <WelcomeStep
                  nextStep={nextStep}
                  isSubmitted={studentData.application.status === "submitted"}
                />
              ) : (
                currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-outfit mb-4">
                      Personal Information
                    </h2>

                    <div>
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-gray-700 font-chillax"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        defaultValue={
                          studentData?.application?.full_name ||
                          `${user?.firstName || ""} ${
                            user?.lastName || ""
                          }`.trim()
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-gray-700 font-chillax"
                      >
                        Gender *
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        defaultValue={studentData.application.gender || ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="pronouns"
                        className="block text-sm font-medium text-gray-700 font-chillax"
                      >
                        Preferred Pronouns
                      </label>
                      <div className="mt-1 space-y-2">
                        <select
                          id="pronouns"
                          name="pronouns"
                          defaultValue={studentData.application.pronouns || ""}
                          onChange={(e) =>
                            setShowPronounsOther(e.target.value === "other")
                          }
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                        >
                          <option value="">Select pronouns</option>
                          <option value="she/her">she/her/hers</option>
                          <option value="he/him">he/him/his</option>
                          <option value="they/them">they/them/theirs</option>
                          <option value="other">Other</option>
                        </select>

                        {showPronounsOther && (
                          <input
                            type="text"
                            id="pronouns_other"
                            name="pronouns_other"
                            placeholder="Please specify your pronouns"
                            defaultValue={
                              studentData.application.pronouns_other || ""
                            }
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="university"
                        className="block text-sm font-medium text-gray-700 font-chillax"
                      >
                        University/College *
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
                        htmlFor="major"
                        className="block text-sm font-medium text-gray-700 font-chillax"
                      >
                        Major(s) *
                      </label>
                      <input
                        type="text"
                        id="major"
                        name="major"
                        defaultValue={studentData.application.major || ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="education_level"
                        className="block text-sm font-medium text-gray-700 font-chillax"
                      >
                        Current Education Level *
                      </label>
                      <select
                        id="education_level"
                        name="education_level"
                        defaultValue={
                          studentData.application.education_level || ""
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                        required
                      >
                        <option value="">Select year</option>
                        <option value="1">First Year</option>
                        <option value="2">Second Year</option>
                        <option value="3">Third Year</option>
                        <option value="4">Fourth Year</option>
                        <option value="5">Fifth+ Year</option>
                        <option value="graduate">Graduate Student</option>
                      </select>
                    </div>
                  </div>
                )
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-outfit mb-4">
                    Experience & Preferences
                  </h2>

                  <div>
                    <label
                      htmlFor="is_first_datathon"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      Is this your first Datathon? *
                    </label>
                    <select
                      id="is_first_datathon"
                      name="is_first_datathon"
                      defaultValue={
                        studentData.application.is_first_datathon ? "yes" : "no"
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    >
                      <option value="">Select answer</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="comfort_level"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      How comfortable do you feel about working on a data
                      project? *
                    </label>
                    <input
                      type="range"
                      id="comfort_level"
                      name="comfort_level"
                      min="1"
                      max="5"
                      defaultValue={
                        studentData.application.comfort_level || "3"
                      }
                      className="mt-1 block w-full"
                      required
                    />
                    <div className="flex justify-between text-xs text-gray-500 font-chillax">
                      <span>Not comfortable</span>
                      <span>Very comfortable</span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="has_team"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      Do you have a team in mind? *
                    </label>
                    <select
                      id="has_team"
                      name="has_team"
                      defaultValue={
                        studentData.application.has_team ? "yes" : "no"
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    >
                      <option value="">Select answer</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="teammates"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      If yes, list your teammates (Name and Email)
                    </label>
                    <textarea
                      id="teammates"
                      name="teammates"
                      rows={3}
                      defaultValue={studentData.application.teammates || ""}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      placeholder="John Doe (john@example.com), Jane Smith (jane@example.com)"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="dietary_restrictions"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      Dietary Restrictions *
                    </label>
                    <div className="mt-2 space-y-2">
                      {[
                        "Vegetarian",
                        "Vegan",
                        "Gluten-Free",
                        "Dairy-Free",
                        "Nut-Free",
                        "None",
                      ].map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            type="checkbox"
                            id={option.toLowerCase()}
                            name="dietary_restrictions"
                            value={option.toLowerCase()}
                            defaultChecked={studentData.application.dietary_restrictions?.includes(
                              option.toLowerCase()
                            )}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor={option.toLowerCase()}
                            className="ml-2 text-sm text-gray-700 font-chillax"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-outfit mb-4">
                    Additional Information
                  </h2>

                  <div>
                    <label
                      htmlFor="development_goals"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      In what ways do you anticipate this Datathon contributing
                      to your professional or academic development? *
                    </label>
                    <textarea
                      id="development_goals"
                      name="development_goals"
                      rows={4}
                      defaultValue={
                        studentData.application.development_goals || ""
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="github_url"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      Github/Portfolio URL *
                    </label>
                    <input
                      type="url"
                      id="github_url"
                      name="github_url"
                      defaultValue={studentData.application.github_url || ""}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="linkedin_url"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      LinkedIn URL *
                    </label>
                    <input
                      type="url"
                      id="linkedin_url"
                      name="linkedin_url"
                      defaultValue={studentData.application.linkedin_url || ""}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-chillax">
                      I confirm that I will be able to participate in the
                      Datathon on April 11th-13th and will be able to attend in
                      person on April 11th and April 13th. *
                    </label>
                    <div className="mt-2">
                      <input
                        type="checkbox"
                        id="attendance_confirmed"
                        name="attendance_confirmed"
                        defaultChecked={
                          studentData.application.attendance_confirmed || false
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        required
                      />
                      <label
                        htmlFor="attendance_confirmed"
                        className="ml-2 text-sm text-gray-700 font-chillax"
                      >
                        Yes, I confirm
                      </label>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="feedback"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      Any questions, feedback, or suggestions for us?
                    </label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      defaultValue={studentData.application.feedback || ""}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep > 0 && (
                <div className="flex justify-between pt-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-100 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-chillax"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-auto bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-chillax"
                  >
                    {currentStep < totalSteps - 1
                      ? "Save & Continue"
                      : "Submit Application"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
