import { FC } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPackages from "./pages/admin/Packages";
import AdminTransactions from "./pages/admin/Transactions";
import AdminCustomers from "./pages/admin/Customers";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerPackages from "./pages/customer/Packages";
import LoginPage from "./pages/Login";
import UnauthorizedPage from "./pages/Unauthorized";
import { CartProvider } from "./context/CartContext";

const App: FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              </ProtectedRoute>
            }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="transactions" element={<AdminTransactions />} />
          </Route>

          <Route
            path="/customer"
            element={
              <ProtectedRoute role="user">
                <CartProvider>
                  <CustomerLayout>
                    <Outlet />
                  </CustomerLayout>
                </CartProvider>
              </ProtectedRoute>
            }>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="packages" element={<CustomerPackages />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
