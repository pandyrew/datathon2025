"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define a generic application type that works with Supabase
interface BaseApplication {
  id: string;
  student_id: string;
  status: string;
  full_name?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface WithdrawalSectionProps {
  application: BaseApplication | null | undefined;
}

export default function WithdrawalSection({
  application,
}: WithdrawalSectionProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if application has been reviewed
    async function checkReview() {
      if (!application?.id) return;

      try {
        const response = await fetch(`/api/ratings/${application.id}`);
        if (response.ok) {
          const data = await response.json();
          setHasReview(!!data.rating);
        }
      } catch (error) {
        console.error("Failed to check review status:", error);
      }
    }

    checkReview();
  }, [application?.id]);

  if (!application) return null;

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/applications/delete", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to withdraw application");
      }
      router.push("/welcome");
    } catch (error) {
      console.error("Failed to withdraw:", error);
    } finally {
      setIsLoading(false);
      setShowWarning(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-end">
      {hasReview ? (
        <p className="text-red-600 font-chillax text-center">
          You cannot withdraw your application after it has been reviewed.
        </p>
      ) : (
        <>
          <button
            onClick={() => setShowWarning(true)}
            className="w-fit py-4 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-chillax"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Withdraw Application"}
          </button>

          {/* Warning Dialog */}
          {showWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 font-outfit">
                  Are you absolutely sure?
                </h3>
                <p className="text-gray-600 mb-6 font-chillax">
                  This action cannot be undone. This will permanently delete
                  your application and you&apos;ll need to start over if you
                  want to apply again.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowWarning(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-chillax"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-chillax"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Yes, withdraw"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
