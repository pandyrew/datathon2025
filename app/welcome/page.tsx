"use client";

import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type StudentData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

export default function WelcomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkStudent() {
      if (user?.id) {
        try {
          const response = await fetch(`/api/students/${user.id}`);
          if (response.ok) {
            const data: StudentData = await response.json();
            // If they already have a role set, redirect to dashboard
            if (data.student.role) {
              router.push("/dashboard");
            }
          }
        } catch (error) {
          console.error("Error checking student:", error);
        }
      }
    }
    checkStudent();
  }, [user?.id, router]);

  if (isLoaded && !user) {
    redirect("/");
  }

  const handleRoleSelect = async (role: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating role:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-outfit font-light text-gray-900 mb-2">
            Welcome to Datathon!
          </h1>
          <p className="text-gray-600 font-chillax">
            Please select your role to continue
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect("participant")}
            disabled={isLoading}
            className="w-full bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors group"
          >
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
              Participant
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Join as a participant to compete in the Datathon
            </p>
          </button>

          <button
            onClick={() => handleRoleSelect("judge")}
            disabled={isLoading}
            className="w-full bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors group"
          >
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
              Judge
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Join as a judge to evaluate projects and provide feedback
            </p>
          </button>

          <button
            onClick={() => handleRoleSelect("mentor")}
            disabled={isLoading}
            className="w-full bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors group"
          >
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
              Mentor
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Join as a mentor to help participants with their projects
            </p>
          </button>
        </div>

        {isLoading && (
          <div className="mt-4 text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2">Setting up your account...</p>
          </div>
        )}
      </div>
    </div>
  );
}