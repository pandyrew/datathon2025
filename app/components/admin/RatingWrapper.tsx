"use client";

import { useState } from "react";
import RatingSystem from "./RatingSystem";

interface RatingWrapperProps {
  applicationId: string;
  applicationRole: string;
}

export default function RatingWrapper({
  applicationId,
  applicationRole,
}: RatingWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRatingUpdated = () => {
    // Increment the key to force a refresh of the component
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <RatingSystem
      key={refreshKey}
      applicationId={applicationId}
      applicationRole={applicationRole}
      onRatingUpdated={handleRatingUpdated}
    />
  );
}
