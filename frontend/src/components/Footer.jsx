import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white dark:border-slate-800/70 dark:bg-slate-950">
      <div className="container-page py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="rounded-2xl bg-brand-primary px-3 py-1 text-sm font-black tracking-tight text-white shadow-soft">
                BiteRush
              </span>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Fast. Fresh. Delivered.
              </span>
            </div>
            <div className="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-300">
              A production-style MERN food ordering UI built for academic demos and real-world flows.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Explore</div>
              <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Link className="block hover:underline" to="/">
                  Home
                </Link>
                <Link className="block hover:underline" to="/restaurants">
                  Restaurants
                </Link>
                <Link className="block hover:underline" to="/menu">
                  Menu
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Account</div>
              <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Link className="block hover:underline" to="/orders">
                  Orders
                </Link>
                <Link className="block hover:underline" to="/cart">
                  Cart
                </Link>
                <Link className="block hover:underline" to="/login">
                  Login
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Project</div>
              <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="block">MERN • JWT • MongoDB</span>
                <span className="block">Tailwind UI System</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200/70 pt-6 text-xs text-slate-500 dark:border-slate-800/70 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} BiteRush</div>
          <div>Academic-ready UI • Consistent theme • Non-breaking APIs</div>
        </div>
      </div>
    </footer>
  );
}

