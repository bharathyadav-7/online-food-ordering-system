import React from "react";

function Star({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "text-amber-400" : "text-slate-200"}`} fill="currentColor">
      <path d="M12 17.3 18.2 21l-1.7-7 5.5-4.7-7.2-.6L12 2 9.2 8.7 2 9.3 7.5 14l-1.7 7L12 17.3Z" />
    </svg>
  );
}

export default function StarRating({ value = 4.3 }) {
  const rounded = Math.max(0, Math.min(5, Math.round(value * 2) / 2));
  const full = Math.floor(rounded);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < full} />
        ))}
      </div>
      <div className="text-xs font-semibold text-slate-600">{rounded.toFixed(1)}</div>
    </div>
  );
}

