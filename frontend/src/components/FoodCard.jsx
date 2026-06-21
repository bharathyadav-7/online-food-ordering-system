import React, { useEffect, useState } from "react";
import StarRating from "../ui/StarRating.jsx";
import { normalizeImageUrl } from "../utils/imageUrl.js";

export default function FoodCard({ item, onAdd, onEdit, onDelete, showAdminActions = false }) {
  const rating = item.rating ?? 4.3;
  const unavailable = item.available === false;
  const imageUrl = normalizeImageUrl(item.image);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);
  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(2,6,23,0.12)]">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-contain p-2 transition duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-bold text-slate-500">
            {imageUrl ? "Image link could not load" : "No image URL"}
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-slate-900 shadow-soft">
          {item.category}
        </div>
        {unavailable ? (
          <div className="absolute right-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-extrabold text-white shadow-soft">
            Unavailable
          </div>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold text-slate-900">{item.name}</div>
            <div className="mt-1">
              <StarRating value={rating} />
            </div>
          </div>
          <div className="shrink-0 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-extrabold text-white">
            ₹{item.price}
          </div>
        </div>
        {item.description ? <div className="text-sm text-slate-600">{item.description}</div> : null}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => onAdd?.(item)}
            disabled={unavailable}
            className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold text-white shadow-soft transition active:translate-y-0 ${
              unavailable ? "bg-slate-400 cursor-not-allowed" : "bg-brand-accent hover:-translate-y-0.5 hover:bg-emerald-500"
            }`}
          >
            {unavailable ? "Unavailable" : "Add to cart"}
          </button>

          {showAdminActions ? (
            <>
              <button
                onClick={() => onEdit?.(item)}
                className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-slate-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(item)}
                className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-rose-500"
              >
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
