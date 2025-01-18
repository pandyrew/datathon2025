import { ClipboardList, Users, Calendar, Book } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div>
            <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="mt-2 h-6 w-64 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Role Selector Skeleton */}
          <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application Status Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-outfit">Application Status</h2>
              </div>
              <div className="space-y-3">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Team Information Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-outfit">Team Information</h2>
              </div>
              <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Important Dates Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-outfit">Important Dates</h2>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Resources Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Book className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-outfit">Resources</h2>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-5 w-28 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
