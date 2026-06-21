import React, { useMemo } from "react";

const STEPS = [
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" }
];

function normalizeStatus(status) {
  if (!status) return "pending";
  return String(status).toLowerCase();
}

export function stepIndexForStatus(status) {
  const s = normalizeStatus(status);
  if (s === "delivered") return 2;
  if (s === "out_for_delivery") return 1;
  if (s === "preparing") return 0;
  if (s === "confirmed") return 0;
  return -1; // pending/cancelled
}

export default function OrderStatusTracker({ status }) {
  const idx = useMemo(() => stepIndexForStatus(status), [status]);
  const s = normalizeStatus(status);

  if (s === "cancelled") {
    return (
      <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
        This order was cancelled.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Order status</div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {String(status).replaceAll("_", " ")}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {STEPS.map((st, i) => {
          const done = idx >= i;
          const active = idx === i;
          return (
            <div key={st.key} className="relative rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div
                className={`absolute -top-3 left-4 grid h-7 w-7 place-items-center rounded-full text-xs font-black shadow-soft ${
                  done ? "bg-brand-accent text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
                aria-hidden="true"
              >
                {i + 1}
              </div>
              <div className={`mt-2 text-sm font-extrabold ${done ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"}`}>
                {st.label}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {done ? (active ? "In progress" : "Completed") : "Pending"}
              </div>
              <div className={`mt-3 h-1.5 w-full rounded-full ${done ? "bg-brand-accent" : "bg-slate-100 dark:bg-slate-800"}`} />
            </div>
          );
        })}
      </div>

      {idx < 0 ? (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Your order is being confirmed. Tracking will update once it moves to Preparing.
        </div>
      ) : null}
    </div>
  );
}

