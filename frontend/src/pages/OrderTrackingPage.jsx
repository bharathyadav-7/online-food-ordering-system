import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import OrderStatusTracker from "../components/OrderStatusTracker.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import { useToast } from "../ui/Toast.jsx";
import { normalizeImageUrl } from "../utils/imageUrl.js";

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [review, setReview] = useState({ rating: 5, title: "Great!", comment: "" });
  const [savedReviews, setSavedReviews] = useState([]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = isAdmin ? await api.get("/orders") : await api.get("/orders/mine");
      const list = data.orders || [];
      const hit = list.find((o) => o._id === id);
      if (!hit) {
        setError("Order not found");
        setOrder(null);
      } else {
        setOrder(hit);
        const reviews = await api.get(`/reviews/order/${hit._id}`);
        setSavedReviews(reviews.data.reviews || []);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load tracking");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin]);

  const shortId = useMemo(() => (order?._id ? order._id.slice(-6) : id?.slice?.(-6)), [order, id]);

  function renderStars(value, onChange) {
    return (
      <div className="inline-flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          const active = n <= value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`h-9 w-9 rounded-xl text-sm font-black transition ${
                active ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
              aria-label={`${n} stars`}
              title={`${n} stars`}
            >
              {n}
            </button>
          );
        })}
      </div>
    );
  }

  async function submitReview() {
    if (!order?._id) return;
    const { data } = await api.post("/reviews", {
      orderId: order._id,
      rating: Number(review.rating) || 0,
      title: String(review.title || "").trim(),
      comment: String(review.comment || "").trim()
    });
    setSavedReviews((prev) => [data.review, ...prev.filter((r) => r._id !== data.review._id)].slice(0, 6));
    setReview({ rating: 5, title: "Great!", comment: "" });
    toast.success("Review saved");
  }

  return (
    <div className="bg-biterush">
      <div className="container-page py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Track Order</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Order #{shortId} • Auto-refreshes every 6 seconds
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/orders" className="btn-ghost">
              Back to orders
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-6">
            <Loader label="Loading tracking..." />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : (
          <>
            <div className="mt-6">
              <OrderStatusTracker status={order.status} />
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Items</div>
                <div className="mt-3 space-y-3">
                  {order.items.map((it, idx) => (
                    <div key={`${order._id}-${idx}`} className="flex gap-3 rounded-2xl bg-brand-bg p-3 dark:bg-slate-900/40">
                      <img src={normalizeImageUrl(it.image)} alt={it.name} className="h-14 w-20 rounded-xl bg-white object-contain p-1" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{it.name}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          ₹{it.price} × {it.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-slate-100">₹{it.price * it.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Total</div>
                <div className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">₹{order.totalAmount}</div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Status updates are driven by your existing order status field.
                </div>
              </div>
            </div>

            {order.status === "delivered" ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Leave a review</div>
                  <div className="mt-3">{renderStars(review.rating, (r) => setReview((v) => ({ ...v, rating: r })))}</div>
                  <div className="mt-3 grid gap-3">
                    <input
                      value={review.title}
                      onChange={(e) => setReview((v) => ({ ...v, title: e.target.value }))}
                      placeholder="Title"
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                    />
                    <textarea
                      rows={4}
                      value={review.comment}
                      onChange={(e) => setReview((v) => ({ ...v, comment: e.target.value }))}
                      placeholder="Write your feedback"
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <button onClick={submitReview} className="mt-4 w-full btn-primary">
                    Submit review
                  </button>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Reviews are saved with your order.
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Your reviews</div>
                  {savedReviews.length === 0 ? (
                    <div className="mt-3 rounded-2xl bg-brand-bg p-4 text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-800">
                      No reviews yet.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {savedReviews.map((r, idx) => (
                        <ReviewCard key={idx} review={r} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

