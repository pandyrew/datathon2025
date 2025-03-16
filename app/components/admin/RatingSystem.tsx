"use client";

import { useState, useEffect } from "react";

interface RatingSystemProps {
  applicationId: string;
  applicationRole: string;
  onRatingUpdated?: () => void;
}

export default function RatingSystem({
  applicationId,
  applicationRole,
  onRatingUpdated,
}: RatingSystemProps) {
  const [rating, setRating] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing rating if any
    async function loadRating() {
      const response = await fetch(`/api/ratings/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.rating) {
          setRating(data.rating.score.toString());
          setFeedback(data.rating.feedback || "");
        }
      }
    }
    loadRating();
  }, [applicationId]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          applicationRole,
          score: parseInt(rating),
          feedback,
        }),
      });

      if (!response.ok) throw new Error("Failed to save rating");

      alert("Rating saved successfully!");

      // Call the callback if provided
      if (onRatingUpdated) {
        onRatingUpdated();
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      alert("Failed to save rating");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-outfit font-medium text-gray-900 mb-4">
        Application Rating
      </h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="Rate 1-10"
            className="font-outfit w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional feedback..."
            className="font-outfit flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
        </div>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-chillax disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isLoading || !rating}
        >
          {isLoading ? "Saving..." : "Save Rating"}
        </button>
      </div>
    </div>
  );
}
