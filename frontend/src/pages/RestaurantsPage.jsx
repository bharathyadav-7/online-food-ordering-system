import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import RestaurantCard from "../components/RestaurantCard.jsx";
import CategoryPills from "../components/CategoryPills.jsx";
import { MenuCardSkeleton } from "../ui/Skeletons.jsx";
import { SearchIcon } from "../ui/Icons.jsx";
import { deriveRestaurantsFromFood, restaurantMatchesQuery } from "../domain/restaurants.js";

export default function RestaurantsPage() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const q = sp.get("q") || "";
  const category = sp.get("category") || "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/food");
      setItems(data.items || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const restaurants = useMemo(() => deriveRestaurantsFromFood(items), [items]);
  const categories = useMemo(() => Array.from(new Set(restaurants.map((r) => r.category))), [restaurants]);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (category && r.category !== category) return false;
      return restaurantMatchesQuery(r, q);
    });
  }, [restaurants, category, q]);

  function setQuery(next) {
    const n = new URLSearchParams(sp);
    if (next) n.set("q", next);
    else n.delete("q");
    setSp(n, { replace: true });
  }

  function setCategory(next) {
    const n = new URLSearchParams(sp);
    if (next) n.set("category", next);
    else n.delete("category");
    setSp(n, { replace: true });
  }

  return (
    <div className="bg-biterush">
      <div className="container-page py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Restaurants</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Browse by category and pick your favorite kitchen.</div>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex w-full items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-soft ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-primary/40 dark:bg-slate-950 dark:ring-slate-800">
              <SearchIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              <input
                value={q}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants..."
                className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <CategoryPills categories={categories} value={category} onChange={setCategory} />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
            <div className="text-lg font-extrabold text-slate-900 dark:text-slate-50">No restaurants found</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Try a different search or category.</div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} onOpen={() => nav(`/restaurants/${r.slug}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

