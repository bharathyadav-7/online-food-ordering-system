import React from "react";
import StarRating from "../ui/StarRating.jsx";

export default function ReviewCard({ review }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{review.title || "Review"}</div>
          <div className="mt-1">
            <StarRating value={review.rating || 0} />
          </div>
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {review.createdAt ? new Date(review.createdAt).toLocaleString() : ""}
        </div>
      </div>
      {review.comment ? <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.comment}</div> : null}
    </div>
  );
}

