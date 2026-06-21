import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import FoodCard from "../components/FoodCard.jsx";
import Loader from "../components/Loader.jsx";
import { normalizeImageUrl } from "../utils/imageUrl.js";

const STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input className="mt-1 w-full rounded-xl" {...props} />
    </div>
  );
}

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ id: "", name: "", price: "", category: "Veg", image: "", description: "", available: true });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/orders/restaurant");
      setRestaurant(data.restaurant);
      setOrders(data.orders || []);

      try {
        const staffRes = await api.get("/orders/delivery-staff");
        setDeliveryStaff(staffRes.data.staff || []);
      } catch (err) {
        console.error("Failed to load delivery staff", err);
      }

      if (data.restaurant?._id) {
        const food = await api.get("/food", { params: { restaurantId: data.restaurant._id } });
        setItems(food.data.items || []);
      } else {
        setItems([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load restaurant dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm({ id: "", name: "", price: "", category: "Veg", image: "", description: "", available: true });
  }

  function startEdit(item) {
    setForm({
      id: item._id,
      name: item.name,
      price: String(item.price),
      category: item.category,
      image: item.image,
      description: item.description || "",
      available: item.available !== false
    });
  }

  async function saveItem(e) {
    e.preventDefault();
    const payload = { ...form, image: normalizeImageUrl(form.image), price: Number(form.price) };
    if (form.id) await api.put(`/food/${form.id}`, payload);
    else await api.post("/food", payload);
    resetForm();
    await load();
  }

  async function deleteItem(item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await api.delete(`/food/${item._id}`);
    await load();
  }

  async function updateStatus(orderId, status) {
    await api.put(`/orders/${orderId}/status`, { status });
    await load();
  }

  async function assignStaff(orderId, staffId) {
    if (!staffId) return;
    await api.put(`/orders/${orderId}/assign-delivery`, { deliveryStaffId: staffId });
    await load();
  }

  return (
    <div className="bg-biterush">
      <div className="container-page py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Restaurant Dashboard</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {restaurant ? `${restaurant.name} menu and incoming orders.` : "Manage menu and incoming orders."}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/menu" className="btn-primary">
              View menu items
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-6">
            <Loader label="Loading restaurant..." />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : !restaurant ? (
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Restaurant profile required</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ask an admin to create a restaurant profile for this account.</div>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 h-fit dark:bg-slate-950 dark:ring-slate-800">
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{form.id ? "Edit menu item" : "Add menu item"}</div>
              <form onSubmit={saveItem} className="mt-4 grid gap-3">
                <Field label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                <Field label="Price" type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
                <Field label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required />
                <Field label="Image URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} required />
                <textarea className="mt-1 w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" />
                <label className="flex items-center gap-2 rounded-2xl bg-brand-bg px-4 py-3 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-800">
                  <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} />
                  Available
                </label>
                <div className="flex gap-2">
                  <button className="btn-primary flex-1">Save</button>
                  {form.id ? <button type="button" onClick={resetForm} className="btn-ghost flex-1">New item</button> : null}
                </div>
              </form>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-brand-primary p-5 text-white shadow-soft">
                  <div className="text-sm font-bold opacity-90">Total Revenue</div>
                  <div className="mt-2 text-3xl font-black">
                    ₹{orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                  <div className="text-sm font-bold text-slate-600 dark:text-slate-400">Completed Orders</div>
                  <div className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">
                    {orders.filter(o => o.status === 'delivered').length}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                  <div className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Orders</div>
                  <div className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">
                    {orders.length}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4">Process Customer Orders (Queue)</div>
                <div className="space-y-4">
                  {orders.length === 0 ? <div className="text-sm text-slate-600 dark:text-slate-300">No restaurant orders yet.</div> : null}
                  {orders.map((o) => (
                    <div key={o._id} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                        <div>
                          <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Order #{o._id.slice(-6)}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{o.userId?.name} • {o.userId?.email}</div>
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
                          <select 
                            className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            value={o.deliveryStaffId?._id || ""}
                            onChange={(e) => assignStaff(o._id, e.target.value)}
                          >
                            <option value="">Assign delivery</option>
                            {deliveryStaff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
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

              <div>
                 <div className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4">Menu Items</div>
                 <div className="grid gap-5 sm:grid-cols-2">
                   {items.map((it) => (
                     <FoodCard key={it._id} item={it} showAdminActions onEdit={startEdit} onDelete={deleteItem} onAdd={() => {}} />
                   ))}
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
