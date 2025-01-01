"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
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

async function saveAndContinue(
  formData: FormData,
  applicationId: string,
  currentStep: number,
  setCurrentStep: (step: number) => void
) {
  try {
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
    setCurrentStep(currentStep + 1);
  } catch (error) {
    console.error("Error saving step:", error);
  }
}

export default function MentorApplication() {
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
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
                    {[1, 2, 3, 4].map((step) => (
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
                        width: `${((currentStep - 1) / 4) * 100}%`,
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
                  await saveAndContinue(
                    formData,
                    studentData.application.id,
                    currentStep,
                    setCurrentStep
                  );
                } else {
                  try {
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

                    await new Promise((resolve) => setTimeout(resolve, 500));
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

                    await new Promise((resolve) => setTimeout(resolve, 500));
                    router.push("/dashboard");
                  } catch (error) {
                    console.error("Form submission error:", error);
                  }
                }
              }}
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-outfit text-gray-900">
                      Data @ UCI Datathon 2025 Mentor Application
                    </h2>

                    <div className="prose prose-indigo font-chillax">
                      <p className="text-gray-600">
                        📊 Thank you for your interest in being a mentor for the
                        third annual collegiate Datathon at UC Irvine! 📊
                      </p>

                      <p className="mt-4 text-gray-600">
                        We plan to bring students from across UCI and Orange
                        County to work on innovative data projects that showcase
                        their analytical skills and passion for data. Attendants
                        will be able to analyze datasets provided by a variety
                        of companies and tackle exciting data challenges.
                      </p>

                      <div className="my-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          Event Information
                        </h3>
                        <p className="mt-2 text-gray-600">
                          The Datathon will occur April 11 - 13 at the
                          [LOCATION]. Mentors will only be needed Saturday,
                          April 13. Detailed schedule and times will be
                          available later.
                        </p>
                      </div>

                      <div className="my-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          Requirements for Mentors
                        </h3>
                        <ul className="mt-2 space-y-1 text-gray-600 list-disc pl-5">
                          <li>Skills in Python, Pandas, R, or SQL</li>
                          <li>Ability to offer help in-person</li>
                          <li>Great attitude 😁👍</li>
                          <li>
                            Able to attend in-person on Saturday, April 13
                          </li>
                        </ul>
                      </div>

                      <div className="mt-6 text-gray-600">
                        <p>
                          Application deadline:{" "}
                          <span className="font-medium">
                            Friday, March 28th
                          </span>
                        </p>
                        <p className="mt-2">
                          If you have any questions, please feel free to email
                          us at{" "}
                          <a
                            href="mailto:data.ucirvine@gmail.com"
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            data.ucirvine@gmail.com
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-chillax text-lg"
                      >
                        Let&apos;s begin →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
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
                      defaultValue={
                        studentData.application.fullName ||
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
                      htmlFor="pronouns"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      Preferred Pronouns *
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
                          defaultValue={
                            studentData.application.pronounsOther || ""
                          }
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
                      defaultValue={studentData.application.affiliation || ""}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    />
                  </div>
                </div>
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
                      {[
                        "Python",
                        "R",
                        "SQL",
                        "MATLAB",
                        "Pandas",
                        "Tableau",
                      ].map((lang) => (
                        <div key={lang} className="flex items-center">
                          <input
                            type="checkbox"
                            id={lang.toLowerCase()}
                            name="programmingLanguages"
                            value={lang}
                            defaultChecked={studentData.application.programmingLanguages?.includes(
                              lang
                            )}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor={lang.toLowerCase()}
                            className="ml-2 text-gray-700 font-chillax"
                          >
                            {lang}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="other"
                          name="programmingLanguages"
                          value="other"
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
                      How comfortable do you feel in your data/programming
                      skills in how you will be able to assist as a mentor? *
                    </label>
                    <input
                      type="range"
                      id="comfortLevel"
                      name="comfortLevel"
                      min="1"
                      max="5"
                      defaultValue={studentData.application.comfortLevel || "3"}
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
                      Have you ever participated in a Datathon/hackathon before
                      as a hacker or mentor? *
                    </label>
                    <div className="mt-2">
                      <input
                        type="radio"
                        id="experienceYes"
                        name="hasHackathonExperience"
                        value="true"
                        defaultChecked={
                          studentData.application.hasHackathonExperience ===
                          true
                        }
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
                        defaultChecked={
                          studentData.application.hasHackathonExperience ===
                          false
                        }
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
                      defaultValue={studentData.application.motivation || ""}
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
                      defaultValue={
                        studentData.application.mentorRoleDescription || ""
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="availability"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      What is your availability on April 13? How long can you be
                      a mentor for? *
                    </label>
                    <p className="mt-1 text-sm text-gray-500 font-chillax">
                      Mentors are required to attend in-person on Saturday,
                      April 13. Shifts could be anytime between 11 AM - 10 PM.
                    </p>
                    <textarea
                      id="availability"
                      name="availability"
                      rows={3}
                      defaultValue={studentData.application.availability || ""}
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
                      htmlFor="linkedin"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      LinkedIn *
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
                      GitHub *
                    </label>
                    <input
                      type="url"
                      id="github"
                      name="github"
                      defaultValue={studentData.application.githubUrl || ""}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-700 font-chillax"
                    >
                      Personal Website / Portfolio
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      defaultValue={studentData.application.websiteUrl || ""}
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
                            defaultChecked={studentData.application.dietaryRestrictions?.includes(
                              pref
                            )}
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
                    className="bg-gray-100 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-chillax"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-chillax"
                  >
                    {currentStep < totalSteps - 1
                      ? "Next"
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
