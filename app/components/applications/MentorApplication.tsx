"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { updateApplicationData, submitApplication } from "@/app/lib/actions";
import LoadingSpinner from "./components/LoadingSpinner";
import MentorWelcome from "./components/MentorWelcome";

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
    programmingLanguages?: string[];
    comfortLevel?: number;
    hasHackathonExperience?: boolean;
    motivation?: string;
    mentorRoleDescription?: string;
    availability?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
    dietaryRestrictions?: string[];
  };
};

type MentorFormData = {
  fullName: string;
  pronouns: string;
  pronounsOther?: string;
  affiliation: string;
  programmingLanguages: string[];
  comfortLevel: string;
  hasHackathonExperience: boolean;
  motivation: string;
  mentorRoleDescription: string;
  availability: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl?: string;
  dietaryRestrictions: string[];
};

async function saveAndContinue(
  formData: MentorFormData,
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

export default function MentorApplication() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [showPronounsOther, setShowPronounsOther] = useState(false);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MentorFormData>({
    fullName: "",
    pronouns: "",
    pronounsOther: "",
    affiliation: "",
    programmingLanguages: [],
    comfortLevel: "3",
    hasHackathonExperience: false,
    motivation: "",
    mentorRoleDescription: "",
    availability: "",
    linkedinUrl: "",
    githubUrl: "",
    websiteUrl: "",
    dietaryRestrictions: [],
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

          if (data.application) {
            setFormData({
              fullName:
                data.application.fullName ||
                `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
              pronouns: data.application.pronouns || "",
              pronounsOther: data.application.pronounsOther || "",
              affiliation: data.application.affiliation || "",
              programmingLanguages: data.application.programmingLanguages || [],
              comfortLevel: data.application.comfortLevel?.toString() || "3",
              hasHackathonExperience:
                data.application.hasHackathonExperience || false,
              motivation: data.application.motivation || "",
              mentorRoleDescription:
                data.application.mentorRoleDescription || "",
              availability: data.application.availability || "",
              linkedinUrl: data.application.linkedinUrl || "",
              githubUrl: data.application.githubUrl || "",
              websiteUrl: data.application.websiteUrl || "",
              dietaryRestrictions: data.application.dietaryRestrictions || [],
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

  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      if (name === "programmingLanguages" || name === "dietaryRestrictions") {
        setFormData((prev) => ({
          ...prev,
          [name]: checkbox.checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checkbox.checked,
        }));
      }
    } else if (name === "hasHackathonExperience") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "true",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
                  Mentor Application
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
                        width: `${((currentStep - 1) / 2) * 100}%`,
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
              <MentorWelcome
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
                  <label className="block text-sm font-medium text-gray-700 font-chillax mb-2">
                    Which of the following languages do you have experience
                    programming in? *
                  </label>
                  <div className="space-y-2">
                    {["Python", "R", "SQL", "MATLAB", "Pandas", "Tableau"].map(
                      (lang) => (
                        <div key={lang} className="flex items-center">
                          <input
                            type="checkbox"
                            id={lang.toLowerCase()}
                            name="programmingLanguages"
                            value={lang}
                            checked={formData.programmingLanguages.includes(
                              lang
                            )}
                            onChange={handleFieldChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor={lang.toLowerCase()}
                            className="ml-2 text-gray-700 font-chillax"
                          >
                            {lang}
                          </label>
                        </div>
                      )
                    )}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="other"
                        name="programmingLanguages"
                        value="other"
                        checked={formData.programmingLanguages.includes(
                          "other"
                        )}
                        onChange={handleFieldChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="other"
                        className="ml-2 text-gray-700 font-chillax"
                      >
                        Other
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="comfortLevel"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    How comfortable do you feel in your data/programming skills
                    in how you will be able to assist as a mentor? *
                  </label>
                  <input
                    type="range"
                    id="comfortLevel"
                    name="comfortLevel"
                    min="1"
                    max="5"
                    value={formData.comfortLevel}
                    onChange={handleFieldChange}
                    className="mt-1 block w-full"
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-500 font-chillax">
                    <span>
                      I have never worked on a data project before, this would
                      be new to me
                    </span>
                    <span>
                      I feel very comfortable in answering any questions,
                      assisting the teams, or critiquing data projects
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-chillax">
                    Have you ever participated in a Datathon/hackathon before as
                    a hacker or mentor? *
                  </label>
                  <div className="mt-2">
                    <input
                      type="radio"
                      id="experienceYes"
                      name="hasHackathonExperience"
                      value="true"
                      checked={formData.hasHackathonExperience === true}
                      onChange={(e) => {
                        e.preventDefault();
                        setFormData((prev) => ({
                          ...prev,
                          hasHackathonExperience: true,
                        }));
                      }}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      required
                    />
                    <label
                      htmlFor="experienceYes"
                      className="ml-2 text-gray-700 font-chillax"
                    >
                      Yes
                    </label>
                    <input
                      type="radio"
                      id="experienceNo"
                      name="hasHackathonExperience"
                      value="false"
                      checked={formData.hasHackathonExperience === false}
                      onChange={(e) => {
                        e.preventDefault();
                        setFormData((prev) => ({
                          ...prev,
                          hasHackathonExperience: false,
                        }));
                      }}
                      className="ml-4 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      required
                    />
                    <label
                      htmlFor="experienceNo"
                      className="ml-2 text-gray-700 font-chillax"
                    >
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="motivation"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    Why are you considering the mentor position for our
                    Datathon? *
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
                    htmlFor="mentorRoleDescription"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    Please describe how you would see yourself in a mentor
                    position. *
                  </label>
                  <textarea
                    id="mentorRoleDescription"
                    name="mentorRoleDescription"
                    rows={4}
                    value={formData.mentorRoleDescription}
                    onChange={handleFieldChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="availability"
                    className="block text-sm font-medium text-gray-700 font-chillax"
                  >
                    What is your availability on April 13? How long can you be a
                    mentor for? *
                  </label>
                  <p className="mt-1 text-sm text-gray-500 font-chillax">
                    Mentors are required to attend in-person on Saturday, April
                    13. Shifts could be anytime between 11 AM - 10 PM.
                  </p>
                  <textarea
                    id="availability"
                    name="availability"
                    rows={3}
                    value={formData.availability}
                    onChange={handleFieldChange}
                    className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-outfit mb-4">
                  External Links & Preferences
                </h2>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-chillax mb-2">
                    Please share your food preferences:
                  </label>
                  <div className="space-y-2">
                    {[
                      "Vegetarian",
                      "Vegan",
                      "Gluten-Free",
                      "Dairy-Free",
                      "Nut-Free",
                    ].map((pref) => (
                      <div key={pref} className="flex items-center">
                        <input
                          type="checkbox"
                          id={pref.toLowerCase()}
                          name="dietaryRestrictions"
                          value={pref}
                          checked={formData.dietaryRestrictions.includes(pref)}
                          onChange={handleFieldChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={pref.toLowerCase()}
                          className="ml-2 text-gray-700 font-chillax"
                        >
                          {pref}
                        </label>
                      </div>
                    ))}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="other-dietary"
                        name="dietaryRestrictions"
                        value="other"
                        checked={formData.dietaryRestrictions.includes("other")}
                        onChange={handleFieldChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="other-dietary"
                        className="ml-2 text-gray-700 font-chillax"
                      >
                        Other
                      </label>
                    </div>
                  </div>
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
