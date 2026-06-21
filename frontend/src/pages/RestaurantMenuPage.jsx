import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import FoodCard from "../components/FoodCard.jsx";
import { MenuCardSkeleton } from "../ui/Skeletons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../ui/Toast.jsx";
import { deriveRestaurantsFromFood } from "../domain/restaurants.js";

export default function RestaurantMenuPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { isAuthed } = useAuth();
  const { refresh } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);
  const [addingId, setAddingId] = useState("");

  async function loadRestaurantMeta() {
    const { data } = await api.get("/food");
    const r = deriveRestaurantsFromFood(data.items || []);
    setRestaurants(r);
    return r;
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await loadRestaurantMeta();
      const hit = r.find((x) => x.slug === slug);
      if (!hit) {
        setError("Restaurant not found");
        setItems([]);
        return;
      }
      const { data } = await api.get("/food", { params: { category: hit.category } });
      setItems(data.items || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load restaurant menu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const restaurant = useMemo(() => restaurants.find((x) => x.slug === slug), [restaurants, slug]);

  async function addToCart(item) {
    if (!isAuthed) {
      toast.info("Please login to add items to cart.");
      nav("/login");
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-extrabold text-slate-600 dark:text-slate-300">
              <Link className="hover:underline" to="/restaurants">
                Restaurants
              </Link>{" "}
              / <span className="text-slate-900 dark:text-slate-100">{restaurant?.name || "Menu"}</span>
            </div>
            <div className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              {restaurant?.name || "Restaurant Menu"}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {restaurant ? `${restaurant.location} • ${restaurant.itemsCount} items` : "Pick items and add to cart."}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/cart" className="btn-ghost">
              Go to cart
            </Link>
            <Link to="/menu" className="btn-primary">
              All menu
            </Link>
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
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
            <div className="text-lg font-extrabold text-slate-900 dark:text-slate-50">No items in this menu</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Try another restaurant.</div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
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

