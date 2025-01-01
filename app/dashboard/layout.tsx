"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

type StudentData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkStudent() {
      if (user?.id) {
        try {
          const response = await fetch(`/api/students/${user.id}`);
          if (!response.ok) {
            // If student not found (404) or any other error, redirect to welcome
            redirect("/welcome");
            return;
          }

          const data: StudentData = await response.json();
          // If they don't have a role set, redirect to welcome page
          if (!data.student.role) {
            redirect("/welcome");
          }
        } catch (error) {
          console.error("Error checking student:", error);
          // On any error, redirect to welcome page
          redirect("/welcome");
        } finally {
          setIsChecking(false);
        }
      }
    }
    checkStudent();
  }, [user?.id]);

  if (isLoaded && !user) {
    redirect("/");
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-10">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-chillax"
              >
                ← Back to Home
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-chillax"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/application"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-chillax"
              >
                Application
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
