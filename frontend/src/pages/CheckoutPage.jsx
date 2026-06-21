import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../ui/Toast.jsx";
import { CartRowSkeleton } from "../ui/Skeletons.jsx";

export default function CheckoutPage() {
  const nav = useNavigate();
  const toast = useToast();
  const { refresh } = useCart();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    pincode: ""
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load checkout");
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

  function validate() {
    if (!cart.length) return "Your cart is empty.";
    if (!address.fullName.trim()) return "Full name is required.";
    if (!address.phone.trim()) return "Phone number is required.";
    if (!address.line1.trim()) return "Address line 1 is required.";
    if (!address.city.trim()) return "City is required.";
    if (!address.pincode.trim()) return "Pincode is required.";
    return "";
  }

  async function placeOrder() {
    const msg = validate();
    if (msg) {
      toast.error(msg);
      return;
    }
    setPlacing(true);
    try {
      await api.post("/orders/place", { paymentMethod, address });
      await refresh();
      toast.success("Payment successful. Order placed!");
      nav("/orders", { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="bg-biterush">
      <div className="container-page py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Checkout</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Address, payment, confirm order.</div>
          </div>
          <div className="flex gap-2">
            <Link to="/cart" className="btn-ghost">
              Back to cart
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
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
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
            <div className="text-lg font-extrabold text-slate-900 dark:text-slate-50">Your cart is empty</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Add items from the menu and return here.</div>
            <Link to="/menu" className="mt-6 inline-flex btn-primary">
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <div className="text-lg font-black text-slate-900 dark:text-slate-100">Delivery address</div>
                <div className="mt-4 grid gap-3">
                  <input
                    value={address.fullName}
                    onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))}
                    placeholder="Full name"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                  />
                  <input
                    value={address.phone}
                    onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                  />
                  <input
                    value={address.line1}
                    onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                    placeholder="Address line 1"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                  />
                  <input
                    value={address.line2}
                    onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                    placeholder="Address line 2 (optional)"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      placeholder="City"
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                    />
                    <input
                      value={address.pincode}
                      onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
                      placeholder="Pincode"
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <div className="text-lg font-black text-slate-900 dark:text-slate-100">Payment</div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Simulated payment UI for viva/demo. Select a method and confirm.
                </div>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>
                <div className="mt-3 rounded-2xl bg-brand-bg p-4 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-800">
                  <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-slate-600 dark:text-slate-400">Payable</span>
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100">₹{total}</span>
                  </div>
                </div>
                <button
                  disabled={placing}
                  onClick={placeOrder}
                  className="mt-4 w-full rounded-2xl bg-brand-accent px-4 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:opacity-60 active:translate-y-0"
                >
                  {placing ? "Processing..." : "Pay & Place Order"}
                </button>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Success/failure is simulated via the same order placement request.
                </div>
              </div>
            </div>

            <div className="h-fit rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
              <div className="text-lg font-black text-slate-900 dark:text-slate-100">Order summary</div>
              <div className="mt-4 space-y-3">
                {cart.map((ci) => (
                  <div key={ci.foodItem?._id} className="flex items-center justify-between gap-3 rounded-2xl bg-brand-bg px-4 py-3 dark:bg-slate-900/40">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">{ci.foodItem?.name}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        ₹{ci.foodItem?.price} × {ci.quantity}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-black text-slate-900 dark:text-slate-100">
                      ₹{(ci.foodItem?.price || 0) * ci.quantity}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Total</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">₹{total}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

