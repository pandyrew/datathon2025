"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, ChevronDown, Check } from "lucide-react";

type Role = "participant" | "mentor" | "coordinator" | "judge";

interface RoleSelectorProps {
  currentRole: Role;
}

export default function RoleSelector({ currentRole }: RoleSelectorProps) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const roles: Role[] = ["participant", "judge", "mentor", "coordinator"];

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === currentRole) {
      setIsOpen(false);
      return;
    }

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
    setIsOpen(false);
  };

  const updateRole = async (role: Role) => {
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
      await fetch("/api/applications/delete", {
        method: "DELETE",
      });
      await updateRole(selectedRole);
    } catch (error) {
      console.error("Error during role change:", error);
    } finally {
      setIsLoading(false);
      setShowWarning(false);
    }
  };

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <UserCircle className="w-6 h-6 text-gray-400 mt-1" />
          <div>
            <h2 className="text-xl font-outfit mb-2">Current Role</h2>
            <p className="text-gray-600 font-chillax capitalize">
              {currentRole}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoading}
            className="flex items-center justify-between w-full sm:w-48 px-4 py-2 text-base bg-white border border-gray-300 rounded-md font-chillax hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="capitalize">{currentRole}</span>
            <ChevronDown
              className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-50 font-chillax"
                >
                  <span className="capitalize">{role}</span>
                  {role === currentRole && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Warning Dialog */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-outfit">
              Warning
            </h3>
            <p className="text-gray-600 mb-6 font-chillax">
              Changing your role will delete your current application. This
              action cannot be undone. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end space-x-4 font-chillax">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-chillax"
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