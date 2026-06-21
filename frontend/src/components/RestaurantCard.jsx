import React from "react";
import StarRating from "../ui/StarRating.jsx";

export default function RestaurantCard({ restaurant, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full overflow-hidden rounded-2xl bg-white text-left shadow-soft ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(2,6,23,0.12)] dark:bg-slate-950 dark:ring-slate-800"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={restaurant.heroImage}
          alt={restaurant.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-slate-900 shadow-soft">
          {restaurant.category}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">{restaurant.name}</div>
            <div className="mt-1 flex items-center gap-2">
              <StarRating value={restaurant.rating} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="shrink-0 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white dark:bg-slate-100 dark:text-slate-900">
            {restaurant.itemsCount} items
          </div>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300">{restaurant.location}</div>
      </div>
    </button>
  );
}

