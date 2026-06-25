import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingCollectionDetail() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-72 w-full" />
    </div>
  )
}
