import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon } from "../ui/Icons.jsx";

export default function HomePage() {
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const chips = useMemo(
    () => [
      { label: "Pizza", value: "Pizza" },
      { label: "Burgers", value: "Burger" },
      { label: "Drinks", value: "Beverages" },
      { label: "Desserts", value: "Dessert" }
    ],
    []
  );

  function goSearch(e) {
    e.preventDefault();
    const query = q.trim();
    nav(query ? `/menu?q=${encodeURIComponent(query)}` : "/menu");
  }

  return (
    <div className="bg-biterush-hero">
      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold tracking-wide text-slate-900 shadow-soft dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
              <span className="h-2 w-2 rounded-full bg-brand-primary" />
              BiteRush • Fast. Fresh. Delivered.
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 lg:text-6xl dark:text-slate-50">
              Delicious food delivered to your door
            </h1>
            <p className="max-w-xl text-base text-slate-600 dark:text-slate-300">
              Discover top-rated meals, filter by category, and checkout in seconds. A clean, startup-style experience built for speed.
            </p>

            <form onSubmit={goSearch} className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-soft ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-primary/40 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800">
                <SearchIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search pizza, burgers, drinks..."
                  className="w-full border-0 bg-transparent p-0 text-sm font-semibold placeholder:text-slate-400 focus:ring-0 dark:placeholder:text-slate-500"
                />
              </div>
              <button className="btn-primary">Search</button>
            </form>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {chips.map((c) => (
                <Link key={c.label} to={`/menu?category=${encodeURIComponent(c.value)}`} className="chip">
                  {c.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/menu" className="btn-primary">
                Order now
              </Link>
              <Link to="/menu" className="btn-ghost">
                View menu
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-white/60 blur-2xl dark:bg-slate-950/40" />
            <div className="grid gap-4 rounded-[2.5rem] bg-white p-5 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-7 overflow-hidden rounded-3xl bg-slate-100">
                  <img
                    src="https://cdn.uengage.io/uploads/10295/image-3982-1770195634.jpg"
                    alt="Fresh food bowl"
                    className="h-[280px] w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="col-span-5 grid gap-4">
                  {[
                    {
                      alt: "Pizza",
                      src: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=1200&q=60"
                    },
                    {
                      alt: "Burger",
                      src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=60"
                    }
                  ].map((img) => (
                    <div key={img.alt} className="group overflow-hidden rounded-3xl bg-slate-100">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-[132px] w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 rounded-3xl bg-brand-bg p-5 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Today’s picks</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Best rated</div>
                </div>
                <div className="grid gap-2 text-sm">
                  {[
                    { name: "French Fries", price: "₹119" },
                    { name: "Chicken Dum biryani", price: "₹179" },
                    { name: "Hyderabadi Biryani", price: "₹199" },
                    { name: "Margherita Pizza", price: "₹199" },
                    { name: "Chocolate Delight", price: "₹99" }
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-soft dark:bg-slate-950">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{r.name}</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">{r.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {[
            { title: "Lightning-fast ordering", desc: "Desktop-first UI with clean spacing and smooth interactions." },
            { title: "Smart discovery", desc: "Search, categories, and ratings to find the right meal quickly." },
            { title: "Checkout clarity", desc: "Modern cart and summary designed for confident ordering." }
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800"
            >
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">{c.title}</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-16">
          <div className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-6 text-center">Platform Roles & Responsibilities</div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                role: "Customer",
                tasks: [
                  "Register and log in",
                  "Browse restaurants and menus",
                  "Add food items to cart",
                  "Place and track orders",
                  "Make payments",
                  "Give ratings and reviews"
                ]
              },
              {
                role: "Restaurant Owner",
                tasks: [
                  "Manage menu items",
                  "Update prices and availability",
                  "Process customer orders",
                  "Update order status",
                  "View sales and reports"
                ]
              },
              {
                role: "Delivery Staff",
                tasks: [
                  "View assigned orders",
                  "Update delivery status",
                  "Deliver food to customers"
                ]
              },
              {
                role: "Admin",
                tasks: [
                  "Manage restaurants and users",
                  "Monitor payments and reports",
                  "Handle complaints and issues"
                ]
              }
            ].map((r) => (
              <div key={r.role} className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">{r.role}</div>
                <ul className="mt-4 space-y-2">
                  {r.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

