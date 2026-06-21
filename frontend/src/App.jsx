import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import RestaurantsPage from "./pages/RestaurantsPage.jsx";
import RestaurantMenuPage from "./pages/RestaurantMenuPage.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import OrderTrackingPage from "./pages/OrderTrackingPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import RestaurantDashboard from "./pages/RestaurantDashboard.jsx";
import DeliveryDashboard from "./pages/DeliveryDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { roleHome } from "./routes/roleHome.js";

function RequireGuest({ children }) {
  const { isAuthed, user } = useAuth();
  const loc = useLocation();
  if (isAuthed) return <Navigate to={roleHome(user?.role)} replace state={{ from: loc }} />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/:slug" element={<RestaurantMenuPage />} />
          <Route path="/menu" element={<MenuPage />} />

          <Route
            path="/login"
            element={
              <RequireGuest>
                <AuthPage mode="login" />
              </RequireGuest>
            }
          />
          <Route
            path="/register"
            element={
              <RequireGuest>
                <AuthPage mode="register" />
              </RequireGuest>
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute requireRoles={["restaurant"]} />}>
            <Route path="/dashboard/restaurant" element={<RestaurantDashboard />} />
          </Route>

          <Route element={<ProtectedRoute requireRoles={["delivery"]} />}>
            <Route path="/dashboard/delivery" element={<DeliveryDashboard />} />
          </Route>

          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

