import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../ui/Toast.jsx";
import EmptyCartIllustration from "../components/EmptyCartIllustration.jsx";
import { CartRowSkeleton } from "../ui/Skeletons.jsx";
import { normalizeImageUrl } from "../utils/imageUrl.js";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const { refresh } = useCart();
  const toast = useToast();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(() => {
    return cart.reduce((sum, ci) => sum + (ci.foodItem?.price || 0) * ci.quantity, 0);
  }, [cart]);

  async function setQty(foodItemId, quantity) {
    setBusyId(foodItemId);
    try {
      const { data } = await api.put(`/cart/${foodItemId}`, { quantity });
      setCart(data.cart || []);
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update");
    } finally {
      setBusyId("");
    }
  }

  async function remove(foodItemId) {
    setBusyId(foodItemId);
    try {
      const { data } = await api.delete(`/cart/${foodItemId}`);
      setCart(data.cart || []);
      await refresh();
      toast.info("Removed from cart");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="bg-biterush">
      <div className="container-page py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Cart</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Review items and place your order.</div>
          </div>
          <Link to="/menu" className="text-sm font-extrabold text-slate-900 hover:underline dark:text-slate-100">
            Back to menu
          </Link>
        </div>

      {loading ? (
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <CartRowSkeleton key={i} />
            ))}
          </div>
          <div className="h-fit rounded-2xl bg-white p-5 shadow-soft">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : cart.length === 0 ? (
        <div className="mt-6 grid gap-6 rounded-3xl bg-white p-6 shadow-soft md:grid-cols-2 md:items-center md:p-10 dark:bg-slate-950 dark:ring-1 dark:ring-slate-800">
          <div className="max-w-md">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-50">Your cart is empty</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Add some tasty items and come back to checkout.</div>
            <Link to="/menu" className="mt-6 inline-flex rounded-2xl bg-brand-primary px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:bg-brand-primaryDark">
              Explore menu
            </Link>
          </div>
          <div className="md:justify-self-end">
            <div className="max-w-sm">
              <EmptyCartIllustration />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {cart.map((ci) => (
              <div
                key={ci.foodItem?._id}
                className="group flex gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(2,6,23,0.10)] dark:bg-slate-950 dark:ring-slate-800"
              >
                <img
                  src={normalizeImageUrl(ci.foodItem?.image)}
                  alt={ci.foodItem?.name}
                  className="h-20 w-28 rounded-2xl bg-white object-contain p-1"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{ci.foodItem?.category}</div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">{ci.foodItem?.name}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-extrabold text-white">
                      ₹{ci.foodItem?.price}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      disabled={busyId === ci.foodItem?._id}
                      onClick={() => setQty(ci.foodItem._id, Math.max(1, ci.quantity - 1))}
                      className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-extrabold text-slate-900 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                      -
                    </button>
                    <div className="min-w-10 text-center text-sm font-semibold text-slate-900">{ci.quantity}</div>
                    <button
                      disabled={busyId === ci.foodItem?._id}
                      onClick={() => setQty(ci.foodItem._id, ci.quantity + 1)}
                      className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-extrabold text-slate-900 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                      +
                    </button>
                    <button
                      disabled={busyId === ci.foodItem?._id}
                      onClick={() => remove(ci.foodItem._id)}
                      className="ml-auto rounded-2xl bg-rose-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-rose-500 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">Summary</div>

            <div className="mt-5 rounded-2xl bg-brand-bg p-4 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-800">
            <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
              <span className="text-slate-600 dark:text-slate-400">Items</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">{cart.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
              <span className="text-slate-600 dark:text-slate-400">Delivery</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">Free</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
              <span className="text-slate-600 dark:text-slate-400">Payable</span>
              <span className="text-xl font-black text-slate-900 dark:text-slate-100">₹{total}</span>
            </div>
            </div>
            <Link to="/checkout" className="mt-4 inline-flex w-full justify-center btn-accent">
              Proceed to checkout
            </Link>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Next: add address and select payment.</div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

