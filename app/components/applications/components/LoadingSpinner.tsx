export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Form Skeleton */}
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />

            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Fields Section */}
          <div className="space-y-4 pt-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-24 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
