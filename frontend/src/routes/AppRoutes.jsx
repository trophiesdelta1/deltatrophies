import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import SiteLayout from "../layouts/SiteLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const Shop = lazy(() => import("../pages/Shop"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Gallery = lazy(() => import("../pages/Gallery"));
const Heritage = lazy(() => import("../pages/Heritage"));
const Contact = lazy(() => import("../pages/Contact"));
const Distributors = lazy(() => import("../pages/Distributors"));
const AdminLogin = lazy(() => import("../pages/admin/Login"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const ManageProducts = lazy(() => import("../pages/admin/ManageProducts"));
const Leads = lazy(() => import("../pages/admin/Leads"));
const NotFound = lazy(() => import("../pages/NotFound"));

function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="collections" element={<Shop />} />
          <Route path="collections/:id" element={<ProductDetail />} />
          <Route path="products/:id/:slug" element={<ProductDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="heritage" element={<Heritage />} />
          <Route path="contact" element={<Contact />} />
          <Route path="distributors" element={<Distributors />} />
          <Route path="admin" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="admin/dashboard" element={<Dashboard />} />
            <Route path="admin/products" element={<ManageProducts />} />
            <Route path="admin/leads" element={<Leads />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
