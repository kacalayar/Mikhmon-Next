import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Deterministic column widths to avoid Math.random during render
const COLUMN_WIDTHS = [80, 100, 60, 120, 90, 70, 110, 85];

interface PageSkeletonProps {
  /** Show card wrapper */
  showCard?: boolean;
  /** Number of table rows to show */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Show search input skeleton */
  showSearch?: boolean;
  /** Show header with icon */
  showHeader?: boolean;
}

export function PageSkeleton({
  showCard = true,
  rows = 5,
  columns = 5,
  showSearch = true,
  showHeader = true,
}: PageSkeletonProps) {
  const content = (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      {showSearch && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full sm:max-w-xs" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}

      {/* Table Skeleton */}
      <div className="rounded-md border">
        {/* Table Header */}
        <div className="border-b bg-muted/50 p-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{
                  width: `${COLUMN_WIDTHS[i % COLUMN_WIDTHS.length]}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center gap-4 border-b p-3 last:border-0"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4"
                style={{
                  width: `${((rowIndex + colIndex) % 4) * 20 + 50}px`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );

  if (!showCard) {
    return <div className="flex h-full flex-col space-y-4">{content}</div>;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Card className="flex flex-col overflow-hidden">
        {showHeader && (
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardHeader>
        )}
        <CardContent className="flex-1 overflow-hidden">{content}</CardContent>
      </Card>
    </div>
  );
}

interface DashboardSkeletonProps {
  /** Number of stat cards */
  statCards?: number;
  /** Show chart skeleton */
  showChart?: boolean;
  /** Show table skeleton */
  showTable?: boolean;
}

export function DashboardSkeleton({
  statCards = 4,
  showChart = true,
  showTable = true,
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: statCards }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-7 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      {showChart && (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {showTable && <PageSkeleton showCard={true} showHeader={false} />}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
