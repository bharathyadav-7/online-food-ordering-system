import React from "react";

function Shimmer({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />;
}

export function MenuCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <Shimmer className="aspect-[16/10] w-full" />
      <div className="space-y-3 p-4">
        <Shimmer className="h-3 w-20 rounded-full" />
        <Shimmer className="h-4 w-40" />
        <Shimmer className="h-3 w-56" />
        <div className="flex items-center justify-between pt-1">
          <Shimmer className="h-7 w-20 rounded-xl" />
          <Shimmer className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CartRowSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 shadow-soft">
      <Shimmer className="h-20 w-28 rounded-2xl" />
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Shimmer className="h-3 w-24 rounded-full" />
            <Shimmer className="h-4 w-44" />
          </div>
          <Shimmer className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Shimmer className="h-9 w-9 rounded-xl" />
          <Shimmer className="h-4 w-10" />
          <Shimmer className="h-9 w-9 rounded-xl" />
          <Shimmer className="ml-auto h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

