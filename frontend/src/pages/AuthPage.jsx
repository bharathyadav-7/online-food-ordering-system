import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { roleHome } from "../routes/roleHome.js";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const location = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const res = isLogin ? await login(email, password) : await register(name, email, password);
    if (!res.ok) setError(res.message);
    else nav(location.state?.from?.pathname || roleHome(res.user?.role));
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-soft md:p-8">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-slate-900">{isLogin ? "Welcome back" : "Create account"}</div>
          <div className="text-sm text-slate-600">
            {isLogin ? "Login to continue ordering." : "Register to start ordering."}
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {!isLogin ? (
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className="mt-1 w-full rounded-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        {isLogin ? (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Fast Login For Demo</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setEmail("customer@gmail.com"); setPassword("User@123"); }}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => { setEmail("admin@gmail.com"); setPassword("Admin@123"); }}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail("restaurant@gmail.com"); setPassword("Restaurant@123"); }}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Restaurant
              </button>
              <button
                type="button"
                onClick={() => { setEmail("delivery@gmail.com"); setPassword("Delivery@123"); }}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Delivery
              </button>
            </div>
            <div className="mt-2 text-center text-xs text-slate-400">Click a role to auto-fill credentials, then press Login.</div>
          </div>
        ) : null}

        <div className="mt-5 text-center text-sm text-slate-600">
          {isLogin ? (
            <>
              New here?{" "}
              <Link className="font-semibold text-slate-900" to="/register">
                Create account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link className="font-semibold text-slate-900" to="/login">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
