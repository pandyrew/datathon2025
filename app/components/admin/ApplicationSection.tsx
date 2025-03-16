"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Application,
  ApplicationType,
  ApplicationStatus,
} from "@/app/types/application";
import { useEffect, useState } from "react";

interface ApplicationSectionProps {
  title: string;
  description: string;
  applications: Application[];
  type: ApplicationType;
  cutoffScore?: number;
}

interface Rating {
  score: number;
  feedback?: string;
}

// Define acceptance thresholds per role
const ACCEPTANCE_THRESHOLDS: Record<
  Exclude<ApplicationType, "coordinator">,
  number
> = {
  participant: 140,
  mentor: 30,
  judge: 20,
};

export default function ApplicationSection({
  title,
  description,
  applications,
  type,
}: ApplicationSectionProps) {
  const [ratings, setRatings] = useState<Record<string, Rating>>({});

  // Fetch ratings for all applications
  useEffect(() => {
    const fetchRatings = async () => {
      const ratingPromises = applications.map(async (app) => {
        try {
          const response = await fetch(`/api/ratings/${app.id}`);
          if (response.ok) {
            const data = await response.json();
            return { id: app.id, rating: data.rating };
          }
        } catch (error) {
          console.error("Error fetching rating:", error);
        }
        return { id: app.id, rating: null };
      });

      const results = await Promise.all(ratingPromises);
      const ratingsMap = results.reduce((acc, { id, rating }) => {
        if (rating) acc[id] = rating;
        return acc;
      }, {} as Record<string, Rating>);

      setRatings(ratingsMap);
    };

    fetchRatings();
  }, [applications]);

  // Calculate statistics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(
    (app) => app.status === ApplicationStatus.SUBMITTED
  ).length;
  const acceptedApplications = applications.filter(
    (app) => app.status === ApplicationStatus.ACCEPTED
  ).length;
  const rejectedApplications = applications.filter(
    (app) => app.status === ApplicationStatus.REJECTED
  ).length;

  // Get threshold for current application type
  const threshold = type === "coordinator" ? 0 : ACCEPTANCE_THRESHOLDS[type];
  const spotsRemaining = Math.max(0, threshold - acceptedApplications);

  // Sort applications by rating (highest first, unrated last)
  const sortedApplications = [...applications].sort((a, b) => {
    const ratingA = ratings[a.id]?.score;
    const ratingB = ratings[b.id]?.score;

    // If neither has rating, maintain original order
    if (!ratingA && !ratingB) return 0;
    // If only one has rating, put the rated one first
    if (!ratingA) return 1;
    if (!ratingB) return -1;
    // Sort by score descending
    return ratingB - ratingA;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6">
        <h2 className="text-xl font-outfit mb-2">{title}</h2>
        <p className="text-gray-600 font-chillax mb-6">{description}</p>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 font-chillax">Total</p>
            <p className="text-2xl font-outfit">{totalApplications}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 font-chillax">Submitted</p>
            <p className="text-2xl font-outfit">{pendingApplications}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-chillax">Rejected</p>
            <p className="text-2xl font-outfit">{rejectedApplications}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-chillax">Accepted</p>
            <p className="text-2xl font-outfit">{acceptedApplications}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-chillax">Spots Left</p>
            <p className="text-2xl font-outfit">{spotsRemaining}</p>
          </div>
        </div>

        {/* Threshold Warning */}
        {/* Applications List */}
        <div className="space-y-2">
          {sortedApplications.length > 0 ? (
            sortedApplications.map((application, index) => {
              const isWithinThreshold =
                type === "participant"
                  ? index < ACCEPTANCE_THRESHOLDS.participant
                  : true;

              return (
                <Link
                  href={`/dashboard/admin/applications/${type}/${application.id}`}
                  key={index}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    isWithinThreshold ? "bg-green-50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-outfit text-gray-500 w-8">
                      {index + 1}.
                    </span>
                    <p className="font-chillax text-gray-900 w-48">
                      {application.fullName}
                    </p>
                    <p className="text-sm text-gray-500 font-chillax w-64">
                      {application.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-chillax w-24 text-center ${
                        application.status === ApplicationStatus.SUBMITTED
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === ApplicationStatus.ACCEPTED
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-chillax w-24 text-center">
                      {ratings[application.id]
                        ? `Rating: ${ratings[application.id].score}`
                        : "Not rated"}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 font-chillax">
                No applications received yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
