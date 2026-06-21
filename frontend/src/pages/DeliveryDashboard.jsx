import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Loader from "../components/Loader.jsx";
import { normalizeImageUrl } from "../utils/imageUrl.js";

const STATUSES = ["out_for_delivery", "delivered", "cancelled"];

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/orders/delivery");
      setOrders(data.orders || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load delivery dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(orderId, status) {
    await api.put(`/orders/${orderId}/status`, { status });
    await load();
  }

  return (
    <div className="bg-biterush">
      <div className="container-page py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Delivery Dashboard</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">View assigned orders, update delivery status, and deliver food to customers.</div>
          </div>
          <div className="flex gap-2">
            <Link to="/orders" className="btn-primary">
              My Own Orders
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-6">
            <Loader label="Loading deliveries..." />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : (
          <div className="mt-6">
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="rounded-2xl bg-brand-primary p-5 text-white shadow-soft">
                <div className="text-sm font-bold opacity-90">Active Deliveries</div>
                <div className="mt-2 text-3xl font-black">
                  {orders.filter(o => o.status === 'out_for_delivery' || o.status === 'preparing' || o.status === 'confirmed').length}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <div className="text-sm font-bold text-slate-600 dark:text-slate-400">Completed Deliveries</div>
                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">
                  {orders.filter(o => o.status === 'delivered').length}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <div className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Assigned</div>
                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">
                  {orders.length}
                </div>
              </div>
            </div>

            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4">Assigned Delivery Queue</div>
            
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                  <div className="text-sm text-slate-600 dark:text-slate-300">No deliveries assigned yet.</div>
                </div>
              ) : null}
              {orders.map((o) => (
                <div key={o._id} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Order #{o._id.slice(-6)}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Customer: <span className="font-semibold">{o.userId?.name}</span> • {o.userId?.email}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Pickup from: <span className="font-semibold">{o.restaurantId?.name || "Restaurant"}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-sm font-black text-slate-900 dark:text-slate-100">₹{o.totalAmount}</div>
                      <select 
                        className="rounded-xl border border-blue-500 text-blue-700 bg-blue-50 px-3 py-1.5 text-sm font-semibold focus:outline-none dark:border-blue-500/50 dark:bg-blue-900/20 dark:text-blue-300"
                        value={o.status} 
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  {o.deliveryAddress && o.deliveryAddress.street && (
                    <div className="mt-4 rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100 dark:bg-orange-900/10 dark:ring-orange-900/30">
                      <div className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-1">Delivery Address</div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {o.deliveryAddress.street}, {o.deliveryAddress.city} {o.deliveryAddress.zipCode}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {o.items.map((it, idx) => (
                      <div key={`${o._id}-${idx}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                        <img src={normalizeImageUrl(it.image)} alt={it.name} className="h-14 w-14 rounded-lg bg-white object-contain p-1 shadow-sm" referrerPolicy="no-referrer" />
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{it.name}</div>
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">₹{it.price} × {it.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
