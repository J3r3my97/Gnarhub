export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-xl p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex gap-4">
        <div className="h-12 w-12 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-3">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-16 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <div className="flex-1 flex flex-col items-end">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-12 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
