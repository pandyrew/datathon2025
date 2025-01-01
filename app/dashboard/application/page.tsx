"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ParticipantApplication,
  MentorApplication,
  JudgeApplication,
  CoordinatorApplication,
} from "@/app/components/applications";

type StudentData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

export default function ApplicationPage() {
  const { user, isLoaded } = useUser();
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

  // Render the appropriate application component based on role
  switch (studentData.student.role) {
    case "participant":
      return <ParticipantApplication />;
    case "mentor":
      return <MentorApplication />;
    case "judge":
      return <JudgeApplication />;
    case "coordinator":
      return <CoordinatorApplication />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-900">Invalid Role</h2>
            <p className="mt-2 text-gray-600">
              Please select a valid role to continue.
            </p>
          </div>
        </div>
      );
  }
}
