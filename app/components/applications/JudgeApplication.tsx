"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { updateApplicationData, submitApplication } from "@/app/lib/actions";
import LoadingSpinner from "./components/LoadingSpinner";
import JudgeWelcome from "./components/JudgeWelcome";

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
    pronouns?: string;
    pronounsOther?: string;
    affiliation?: string;
    experience?: string;
    motivation?: string;
    feedbackComfort?: number;
    availability?: boolean;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
  };
};

// Add this type for form data
type JudgeFormData = {
  fullName: string;
  pronouns: string;
  pronounsOther?: string;
  affiliation: string;
  motivation: string;
  experience: string;
  feedbackComfort: string;
  availability: boolean;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl?: string;
};

async function saveAndContinue(
  formData: JudgeFormData,
  applicationId: string,
  currentStep: number,
  setCurrentStep: (step: number) => void,
  setIsSubmitting: (loading: boolean) => void
) {
  setIsSubmitting(true);
  try {
    const formDataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formDataToSubmit.append(key, item));
      } else {
        formDataToSubmit.append(key, value.toString());
      }
    });
    const result = await updateApplicationData(
      applicationId,
      currentStep.toString(),
      formDataToSubmit
    );

    if (!result.success) {
      console.error("Failed to save step:", result.error);
      return;
    }

    console.log("Successfully saved step:", currentStep);
    setCurrentStep(currentStep + 1);
  } catch (error) {
    console.error("Error saving step:", error);
  } finally {
    setIsSubmitting(false);
  }
}

export default function JudgeApplication() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [showPronounsOther, setShowPronounsOther] = useState(false);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In the component, add state for form data
  const [formData, setFormData] = useState<JudgeFormData>({
    fullName: "",
    pronouns: "",
    pronounsOther: "",
    affiliation: "",
    motivation: "",
    experience: "",
    feedbackComfort: "3",
    availability: false,
    linkedinUrl: "",
    githubUrl: "",
    websiteUrl: "",
  });

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

          // Initialize form data with server data
          if (data.application) {
            setFormData({
              fullName:
                data.application.fullName ||
                `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
              pronouns: data.application.pronouns || "",
              pronounsOther: data.application.pronounsOther || "",
              affiliation: data.application.affiliation || "",
              motivation: data.application.motivation || "",
              experience: data.application.experience || "",
              feedbackComfort:
                data.application.feedbackComfort?.toString() || "3",
              availability: data.application.availability || false,
              linkedinUrl: data.application.linkedinUrl || "",
              githubUrl: data.application.githubUrl || "",
              websiteUrl: data.application.websiteUrl || "",
            });
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      }
    }
    fetchStudentData();
  }, [user?.id, user?.firstName, user?.lastName]);

  if (isLoaded && !user) {
    redirect("/");
  }

  if (!studentData) {
    return <LoadingSpinner />;
  }

  if (studentData.student.role !== "judge") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You must be a judge to access this application.
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

  // Add a handler for form field changes
  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Update the handleSubmit function to use formData
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSubmit = new FormData();
      // Add all form data to FormData object
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSubmit.append(key, value.toString());
      });

      if (currentStep < totalSteps - 1) {
        await saveAndContinue(
          formData,
          studentData!.application.id,
          currentStep,
          setCurrentStep,
          setIsSubmitting
        );
      } else {
        const saveResult = await updateApplicationData(
          studentData!.application.id,
          currentStep.toString(),
          formDataToSubmit
        );

        if (!saveResult.success) {
          console.error("Failed to save final step:", saveResult.error);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        const submitResult = await submitApplication(studentData!.student.id);

        if (!submitResult.success) {
          console.error("Failed to submit application:", submitResult.error);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
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
                  Judge Application
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
                        Section {step}
                      </span>
                    ))}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((currentStep - 1) / (totalSteps - 2)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Application Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            {currentStep === 0 ? (
              <JudgeWelcome
                nextStep={nextStep}
                isSubmitted={studentData.application.status === "submitted"}
              />
            ) : (
              currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-outfit mb-4">
                    Basic Information
                  </h2>

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
                      value={formData.fullName}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pronouns"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      Preferred Pronouns *
                    </label>
                    <div className="mt-1 space-y-2">
                      <select
                        id="pronouns"
                        name="pronouns"
                        value={formData.pronouns}
                        onChange={handleFieldChange}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                        required
                      >
                        <option value="">Select pronouns</option>
                        <option value="he/him">he/him/his</option>
                        <option value="she/her">she/her/hers</option>
                        <option value="they/them">they/them/theirs</option>
                        <option value="other">Other</option>
                      </select>

                      {showPronounsOther && (
                        <input
                          type="text"
                          id="pronounsOther"
                          name="pronounsOther"
                          placeholder="Please specify your pronouns"
                          value={formData.pronounsOther}
                          onChange={handleFieldChange}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="affiliation"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      Please state your affiliated university and/or current
                      occupation *
                    </label>
                    <input
                      type="text"
                      id="affiliation"
                      name="affiliation"
                      value={formData.affiliation}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    />
                  </div>
                </div>
              )
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-outfit mb-4">
                  Additional Questions
                </h2>

                <div>
                  <label
                    htmlFor="motivation"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    What do you hope to gain personally or professionally from
                    serving as a judge in this Datathon? *
                  </label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    rows={4}
                    value={formData.motivation}
                    onChange={handleFieldChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="experience"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    What experience do you have with data analysis, data
                    science, or related fields? *
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows={4}
                    value={formData.experience}
                    onChange={handleFieldChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedbackComfort"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    How comfortable are you with giving feedback to
                    participants, both positive and constructive? *
                  </label>
                  <input
                    type="range"
                    id="feedbackComfort"
                    name="feedbackComfort"
                    min="1"
                    max="5"
                    value={formData.feedbackComfort}
                    onChange={handleFieldChange}
                    className="mt-1 block w-full"
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-500 font-chillax">
                    <span>Not comfortable at all</span>
                    <span>Very comfortable</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-chillax">
                    Data projects will be presented in-person on Sunday, April
                    13th. Are you able to commit the full duration of the
                    presentations and judge projects in-person? *
                  </label>
                  <p className="mt-1 text-sm text-gray-500 font-chillax">
                    Judges are required to attend in-person on Sunday, April
                    13th. Judging is set to be between 11 AM - 6 PM (times are
                    subject to change).
                  </p>
                  <div className="mt-2">
                    <input
                      type="checkbox"
                      id="availability"
                      name="availability"
                      checked={formData.availability}
                      onChange={handleFieldChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      required
                    />
                    <label
                      htmlFor="availability"
                      className="ml-2 text-sm text-gray-700 font-chillax"
                    >
                      Yes, I can commit to this time
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-outfit mb-4">External Links</h2>

                <div>
                  <label
                    htmlFor="linkedinUrl"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    LinkedIn *
                  </label>
                  <input
                    type="text"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleFieldChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="githubUrl"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    GitHub *
                  </label>
                  <input
                    type="text"
                    id="githubUrl"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleFieldChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="websiteUrl"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    Personal Website / Portfolio
                  </label>
                  <input
                    type="text"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleFieldChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep > 0 && (
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="bg-gray-100 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-chillax disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-chillax disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {currentStep < totalSteps - 1
                        ? "Saving..."
                        : "Submitting..."}
                    </>
                  ) : currentStep < totalSteps - 1 ? (
                    "Next"
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
