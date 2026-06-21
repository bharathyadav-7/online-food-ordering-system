import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import CategoryPills from "../components/CategoryPills.jsx";
import FoodCard from "../components/FoodCard.jsx";
import { MenuCardSkeleton } from "../ui/Skeletons.jsx";
import { useToast } from "../ui/Toast.jsx";
import { SearchIcon } from "../ui/Icons.jsx";

export default function MenuPage() {
  const [sp, setSp] = useSearchParams();
  const { isAuthed } = useAuth();
  const { refresh } = useCart();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(() => sp.get("category") || "");
  const [q, setQ] = useState(() => sp.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/food", { params: category ? { category } : {} });
      setItems(data.items || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    const nextQ = sp.get("q") || "";
    const nextCat = sp.get("category") || "";
    setQ(nextQ);
    setCategory(nextCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((it) => `${it.name} ${it.description || ""}`.toLowerCase().includes(query));
  }, [items, q]);

  function updateQuery(next) {
    setQ(next);
    const n = new URLSearchParams(sp);
    if (next) n.set("q", next);
    else n.delete("q");
    setSp(n, { replace: true });
  }

  function updateCategory(next) {
    setCategory(next);
    const n = new URLSearchParams(sp);
    if (next) n.set("category", next);
    else n.delete("category");
    setSp(n, { replace: true });
  }

  async function addToCart(item) {
    if (!isAuthed) {
      toast.info("Please login to add items to cart.");
      return;
    }
    setAddingId(item._id);
    try {
      await api.post("/cart/add", { foodItemId: item._id, quantity: 1 });
      await refresh();
      toast.success("Added to cart");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingId("");
    }
  }

  return (
    <div className="bg-biterush">
      <div className="container-page py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-3xl font-black tracking-tight text-slate-900">Menu</div>
          <div className="text-sm text-slate-600">Browse categories, search items, and add to cart.</div>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex w-full items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-soft ring-1 ring-slate-200 lg:w-[420px] focus-within:ring-2 focus-within:ring-brand-primary/40">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search in menu..."
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold placeholder:text-slate-400 focus:ring-0"
            />
          </div>
          <CategoryPills categories={categories} value={category} onChange={updateCategory} />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-soft">
          <div className="text-lg font-extrabold text-slate-900">No items found</div>
          <div className="mt-1 text-sm text-slate-600">Try a different search or category.</div>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <div key={item._id} className={addingId === item._id ? "opacity-80" : ""}>
              <FoodCard item={item} onAdd={addToCart} />
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

