import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Loader from "../components/Loader.jsx";
import { normalizeImageUrl } from "../utils/imageUrl.js";

function StatusBadge({ status }) {
  const map = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-indigo-100 text-indigo-800",
    out_for_delivery: "bg-purple-100 text-purple-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800"
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] || "bg-slate-100 text-slate-800"}`}>
      {String(status).replaceAll("_", " ")}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/orders/mine");
      setOrders(data.orders || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-biterush">
      <div className="container-page py-8">
      <div>
        <div className="text-3xl font-black tracking-tight text-slate-900">Your Orders</div>
        <div className="text-sm text-slate-600">Track your order history and status.</div>
      </div>

      {loading ? (
        <div className="mt-6">
          <Loader label="Loading orders..." />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-soft">
          <div className="text-lg font-semibold text-slate-900">No orders yet</div>
          <div className="mt-1 text-sm text-slate-600">Place an order from your cart to see it here.</div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Order</span> #{o._id.slice(-6)}
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {o.items.map((it, idx) => (
                  <div key={`${o._id}-${idx}`} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                    <img src={normalizeImageUrl(it.image)} alt={it.name} className="h-14 w-20 rounded-lg bg-white object-contain p-1" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{it.name}</div>
                      <div className="text-xs text-slate-600">
                        ₹{it.price} × {it.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-600">Total</span>
                <span className="text-base font-bold text-slate-900">₹{o.totalAmount}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link to={`/orders/${o._id}/track`} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-slate-800">
                  Track order
                </Link>
                <Link to="/menu" className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-900 transition hover:bg-slate-200">
                  Reorder
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

