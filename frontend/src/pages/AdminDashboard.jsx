import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import FoodCard from "../components/FoodCard.jsx";
import Loader from "../components/Loader.jsx";
import { normalizeImageUrl } from "../utils/imageUrl.js";

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input className="mt-1 w-full rounded-xl" {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select className="mt-1 w-full rounded-xl" {...props}>
        {children}
      </select>
    </div>
  );
}

const STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("items");
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ id: "", name: "", price: "", category: "Veg", image: "", description: "", available: true });
  const [restaurantForm, setRestaurantForm] = useState({ name: "", ownerId: "", location: "", description: "" });

  const categories = useMemo(() => ["Veg", "Non-Veg", "Beverages", "Dessert"], []);

  async function loadItems() {
    const { data } = await api.get("/food");
    setItems(data.items || []);
  }

  async function loadOrders() {
    const { data } = await api.get("/orders");
    setOrders(data.orders || []);
  }

  async function loadUsers() {
    const { data } = await api.get("/admin/users");
    setUsers(data.users || []);
  }

  async function loadRestaurants() {
    const { data } = await api.get("/admin/restaurants");
    setRestaurants(data.restaurants || []);
  }

  async function loadSummary() {
    const { data } = await api.get("/admin/summary");
    setSummary(data.summary || null);
    setActivity(data.activity || []);
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadItems(), loadOrders(), loadUsers(), loadRestaurants(), loadSummary()]);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function startCreate() {
    setForm({ id: "", name: "", price: "", category: "Veg", image: "", description: "", available: true });
    setTab("items");
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
    setTab("items");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveItem(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        image: normalizeImageUrl(form.image),
        description: form.description,
        available: form.available
      };
      if (form.id) await api.put(`/food/${form.id}`, payload);
      else await api.post("/food", payload);
      await loadItems();
      startCreate();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setLoading(true);
    try {
      await api.delete(`/food/${item._id}`);
      await loadItems();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    setLoading(true);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      await loadOrders();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId, role) {
    setLoading(true);
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      await Promise.all([loadUsers(), loadRestaurants()]);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  }

  async function createRestaurant(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/restaurants", restaurantForm);
      setRestaurantForm({ name: "", ownerId: "", location: "", description: "" });
      await Promise.all([loadUsers(), loadRestaurants()]);
    } catch (e2) {
      alert(e2?.response?.data?.message || "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  }

  async function assignDelivery(orderId, deliveryStaffId) {
    if (!deliveryStaffId) return;
    setLoading(true);
    try {
      await api.put(`/orders/${orderId}/assign-delivery`, { deliveryStaffId });
      await loadOrders();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to assign delivery");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-900">Admin Dashboard</div>
          <div className="text-sm text-slate-600">Manage food items and orders.</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("items")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === "items" ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-soft hover:bg-slate-100"
            }`}
          >
            Food Items
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === "orders" ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-soft hover:bg-slate-100"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setTab("users")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === "users" ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-soft hover:bg-slate-100"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setTab("restaurants")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === "restaurants" ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-soft hover:bg-slate-100"
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => setTab("activity")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === "activity" ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-soft hover:bg-slate-100"
            }`}
          >
            Activity
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6">
          <Loader label="Loading admin..." />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : tab === "activity" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="text-sm font-semibold text-slate-900">Users</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{summary?.users ?? 0}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="text-sm font-semibold text-slate-900">Orders</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{summary?.orders ?? 0}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="text-sm font-semibold text-slate-900">Reviews</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{summary?.reviews ?? 0}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-soft lg:col-span-3">
            <div className="text-lg font-semibold text-slate-900">System Activity</div>
            <div className="mt-4 space-y-3">
              {activity.map((a) => (
                <div key={a._id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-600">{a.message}</div>
                  <div className="mt-1 text-xs text-slate-500">{a.userId?.email} - {new Date(a.createdAt).toLocaleString()}</div>
                </div>
              ))}
              {activity.length === 0 ? <div className="text-sm text-slate-600">No activity yet.</div> : null}
            </div>
          </div>
        </div>
      ) : tab === "users" ? (
        <div className="mt-6 space-y-4">
          {users.map((u) => (
            <div key={u._id} className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
                <select className="rounded-xl text-sm" value={u.role} onChange={(e) => updateRole(u._id, e.target.value)}>
                  {["customer", "admin", "restaurant", "delivery"].map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : tab === "restaurants" ? (
        <>
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-soft">
            <div className="text-lg font-semibold text-slate-900">Add Restaurant</div>
            <form onSubmit={createRestaurant} className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Name" value={restaurantForm.name} onChange={(e) => setRestaurantForm((f) => ({ ...f, name: e.target.value }))} required />
              <Select label="Owner" value={restaurantForm.ownerId} onChange={(e) => setRestaurantForm((f) => ({ ...f, ownerId: e.target.value }))} required>
                <option value="">Select owner</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} - {u.email}</option>
                ))}
              </Select>
              <Field label="Location" value={restaurantForm.location} onChange={(e) => setRestaurantForm((f) => ({ ...f, location: e.target.value }))} />
              <Field label="Description" value={restaurantForm.description} onChange={(e) => setRestaurantForm((f) => ({ ...f, description: e.target.value }))} />
              <div className="md:col-span-2">
                <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500">Save</button>
              </div>
            </form>
          </div>
          <div className="mt-6 space-y-4">
            {restaurants.map((r) => (
              <div key={r._id} className="rounded-2xl bg-white p-5 shadow-soft">
                <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-500">{r.ownerId?.name} - {r.location || "No location"}</div>
              </div>
            ))}
          </div>
        </>
      ) : tab === "items" ? (
        <>
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-lg font-semibold text-slate-900">{form.id ? "Edit Item" : "Add Item"}</div>
              {form.id ? (
                <button
                  onClick={startCreate}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
                >
                  New item
                </button>
              ) : null}
            </div>

            <form onSubmit={saveItem} className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <Field
                label="Price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Field label="Image URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} required />
              <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} />
                Available
              </label>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="mt-1 w-full rounded-xl"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500">
                  Save
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <FoodCard
                key={it._id}
                item={it}
                showAdminActions
                onEdit={startEdit}
                onDelete={deleteItem}
                onAdd={() => {}}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Order</span> #{o._id.slice(-6)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {o.userId?.name} • {o.userId?.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-slate-900">₹{o.totalAmount}</div>
                  <select
                    className="rounded-xl text-sm"
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-xl text-sm"
                    value={o.deliveryStaffId?._id || ""}
                    onChange={(e) => assignDelivery(o._id, e.target.value)}
                  >
                    <option value="">Assign delivery</option>
                    {users.filter((u) => u.role === "delivery").map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>
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
            </div>
          ))}
          {orders.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-soft">
              <div className="text-lg font-semibold text-slate-900">No orders yet</div>
              <div className="mt-1 text-sm text-slate-600">Place an order as a customer to see it here.</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

