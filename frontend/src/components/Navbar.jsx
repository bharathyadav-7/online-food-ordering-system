import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { CartIcon, MoonIcon, SunIcon, UserIcon } from "../ui/Icons.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { api } from "../api/client.js";
import { useToast } from "../ui/Toast.jsx";

function Item({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-extrabold transition ${
          isActive
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { isAuthed, isAdmin, user, logout } = useAuth();
  const { count } = useCart();
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const nav = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsRef = useRef(null);
  const knownIds = useRef(new Set());
  const markingReadIds = useRef(new Set());
  const role = user?.role || "customer";

  async function loadNotifications() {
    try {
      const { data } = await api.get("/notifications");
      const list = data.notifications || [];
      
      let newUnread = 0;
      let lastMsg = "";
      
      for (const n of list) {
        if (!n.read && !knownIds.current.has(n._id)) {
          newUnread++;
          lastMsg = n.message;
          knownIds.current.add(n._id);
        }
      }
      
      if (newUnread > 0) {
        toast.info(lastMsg || `You have ${newUnread} new notification(s)`);
      }
      
      if (knownIds.current.size === 0 && list.length > 0) {
        list.forEach(n => knownIds.current.add(n._id));
      }

      setNotifications(list);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!isAuthed) {
      setNotifications([]);
      knownIds.current.clear();
      setAlertsOpen(false);
      return;
    }
    loadNotifications();
    const t = setInterval(loadNotifications, 10000);
    return () => clearInterval(t);
  }, [isAuthed]);

  useEffect(() => {
    if (!alertsOpen) return;

    function closeOnOutsideClick(e) {
      if (!alertsRef.current?.contains(e.target)) {
        setAlertsOpen(false);
      }
    }

    function closeOnEscape(e) {
      if (e.key === "Escape") {
        setAlertsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [alertsOpen]);

  useEffect(() => {
    if (!alertsOpen) return;

    const unreadNotifications = notifications.filter((n) => !n.read && !markingReadIds.current.has(n._id));
    if (unreadNotifications.length === 0) return;

    unreadNotifications.forEach((n) => markingReadIds.current.add(n._id));
    setNotifications((current) => current.map((n) => (n.read ? n : { ...n, read: true })));

    Promise.allSettled(unreadNotifications.map((n) => api.put(`/notifications/${n._id}/read`))).then(() => {
      unreadNotifications.forEach((n) => markingReadIds.current.delete(n._id));
    });
  }, [alertsOpen, notifications]);

  async function handleAccept(orderId) {
    try {
      setNotifications((current) =>
        current.filter((n) => !(n.type === "delivery_assignment" && n.orderId === orderId))
      );
      await api.put(`/orders/${orderId}/accept-delivery`);
      toast.success("Delivery accepted!");
      await loadNotifications();
      nav("/dashboard/delivery");
    } catch (e) {
      toast.error("Failed to accept delivery");
    }
  }
  
  async function handleReject(orderId) {
    try {
      setNotifications((current) =>
        current.filter((n) => !(n.type === "delivery_assignment" && n.orderId === orderId))
      );
      await api.put(`/orders/${orderId}/reject-delivery`);
      toast.info("Delivery rejected.");
      await loadNotifications();
    } catch (e) {
      toast.error("Failed to reject delivery");
    }
  }

  const unread = notifications.filter((n) => !n.read).length;
  const notificationTitle = (n) => {
    if (n.title) return n.title;
    if (n.type === "delivery_assignment") return "New Delivery Assigned";
    if (n.message?.includes("has been placed")) return "Order placed";
    if (n.message?.includes("is now")) return "Order status updated";
    return "Notification";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded-2xl bg-brand-primary px-3 py-1 text-sm font-black tracking-tight text-white shadow-soft">
            BiteRush
          </span>
          <span className="hidden text-sm font-extrabold tracking-tight text-slate-900 sm:block dark:text-slate-100">
            Fast. Fresh. Delivered.
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Item to="/">Home</Item>
          {(!isAuthed || role === "customer") ? (
            <>
              <Item to="/restaurants">Restaurants</Item>
              <Item to="/menu">Menu</Item>
              <Item to="/orders">Orders</Item>
              {isAuthed ? <Item to="/dashboard">Dashboard</Item> : null}
            </>
          ) : null}
          {isAuthed && role === "restaurant" ? <Item to="/dashboard/restaurant">Restaurant Dashboard</Item> : null}
          {isAuthed && role === "delivery" ? <Item to="/dashboard/delivery">Delivery Dashboard</Item> : null}
          {isAuthed && isAdmin && <Item to="/admin">Admin Dashboard</Item>}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-100 p-2.5 text-slate-900 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          {(!isAuthed || role === "customer") && (
            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center rounded-2xl bg-slate-100 p-2.5 text-slate-900 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              aria-label="Cart"
            >
              <CartIcon className="h-5 w-5" />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-primary px-1 text-xs font-black text-white">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>
          )}

          {isAuthed ? (
            <div
              ref={alertsRef}
              className="relative"
              onMouseEnter={() => setAlertsOpen(true)}
            >
              <button
                type="button"
                onClick={() => setAlertsOpen((open) => !open)}
                className="relative inline-flex items-center justify-center rounded-2xl bg-slate-100 px-3 py-2.5 text-sm font-black text-slate-900 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                aria-label="Notifications"
                aria-expanded={alertsOpen}
                aria-haspopup="menu"
              >
                Alerts
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-primary px-1 text-xs font-black text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </button>
              
              {alertsOpen && (
                <div
                  className="absolute right-0 top-full z-50 pt-2"
                  onMouseEnter={() => setAlertsOpen(true)}
                >
                  <div className="w-80 rounded-2xl bg-white p-2 shadow-soft ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-2 pt-1 pb-3 text-sm font-black text-slate-900 dark:text-slate-100">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="px-2 pb-2 text-sm text-slate-500">No recent alerts.</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className="mb-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{notificationTitle(n)}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</div>
                          {n.type === "delivery_assignment" && role === "delivery" && (
                            <div className="mt-3 flex gap-2">
                              <button onClick={() => handleAccept(n.orderId)} className="flex-1 rounded-lg bg-brand-primary px-2 py-1.5 text-xs font-bold text-white hover:bg-brand-primary/90 transition">Accept</button>
                              <button onClick={() => handleReject(n.orderId)} className="flex-1 rounded-lg bg-rose-100 px-2 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-200 transition dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50">Reject</button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {isAuthed ? (
            <>
              <div className="hidden items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-soft sm:flex dark:bg-slate-900 dark:text-slate-200">
                <UserIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="max-w-40 truncate">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
