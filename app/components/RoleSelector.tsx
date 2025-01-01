"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "participant" | "mentor" | "coordinator" | "judge";

interface RoleSelectorProps {
  currentRole: Role;
}

export default function RoleSelector({ currentRole }: RoleSelectorProps) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === currentRole) return;
    
    // Store the selected role temporarily
    setSelectedRole(newRole);
    
    // Check if user has an existing application
    const response = await fetch(`/api/applications/check`);
    const { hasApplication } = await response.json();

    if (hasApplication) {
      setShowWarning(true);
    } else {
      await updateRole(newRole);
    }
  };

  const updateRole = async (role: Role) => {
    setIsLoading(true);
    try {
      // Update the role
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

      // Refresh the page to reflect changes
      router.refresh();
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsLoading(false);
      setShowWarning(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      // Delete the existing application
      await fetch("/api/applications/delete", {
        method: "DELETE",
      });

      // Update the role
      await updateRole(selectedRole);
    } catch (error) {
      console.error("Error during role change:", error);
    } finally {
      setIsLoading(false);
      setShowWarning(false);
    }
  };

  return (
    <div className="relative">
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 font-chillax"
        disabled={isLoading}
      >
        <option value="participant">Participant</option>
        <option value="judge">Judge</option>
      </select>

      {/* Warning Dialog */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Warning</h3>
            <p className="text-gray-600 mb-6">
              Changing your role will delete your current application. This action cannot be undone. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
