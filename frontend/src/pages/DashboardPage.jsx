import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";

function Card({ title, children }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const role = user?.role || "customer";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = isAdmin ? await api.get("/orders") : await api.get("/orders/mine");
      setOrders(data.orders || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [isAdmin]);

  return (
    <div className="bg-biterush">
      <div className="container-page py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Dashboard</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {isAdmin ? "Admin view" : "Customer view"} • Role: <span className="font-extrabold">{role}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin ? (
              <Link to="/admin" className="btn-primary">
                Open admin panel
              </Link>
            ) : (
              <>
                <Link to="/menu" className="btn-primary">
                  Browse menu
                </Link>
                {role === "restaurant" ? (
                  <Link to="/dashboard/restaurant" className="btn-ghost">
                    Restaurant panel
                  </Link>
                ) : null}
                {role === "delivery" ? (
                  <Link to="/dashboard/delivery" className="btn-ghost">
                    Delivery panel
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-6">
            <Loader label="Loading dashboard..." />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <Card title="Profile">
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">{user?.name || "User"}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
                </div>
                <div className="mt-4 rounded-2xl bg-brand-bg px-4 py-3 text-xs text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-800">
                  Tip: For viva, explain roles + protected routes and how JWT token is attached to API requests.
                </div>
              </Card>

              {role !== "customer" && !isAdmin ? (
                <Card title="Role modules">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Your role unlocks a dedicated dashboard while customer ordering remains available.
                  </div>
                </Card>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <Card title={isAdmin ? "Recent orders (all users)" : "Recent orders"}>
                {orders.length === 0 ? (
                  <div className="rounded-2xl bg-brand-bg p-4 text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-800">
                    No orders yet. Place an order to see it here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((o) => (
                      <div
                        key={o._id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-bg px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-800"
                      >
                        <div>
                          <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Order #{o._id.slice(-6)}</div>
                          <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                            Status: {String(o.status).replaceAll("_", " ")} • Total: ₹{o.totalAmount}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/orders/${o._id}/track`} className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white">
                            Track
                          </Link>
                          <Link to="/orders" className="rounded-2xl bg-white px-4 py-2 text-xs font-extrabold text-slate-900 shadow-soft">
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

