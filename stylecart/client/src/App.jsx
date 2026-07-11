import { Routes, Route } from 'react-router-dom';

import Layout from './components/layout/Layout.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';

// Public / customer pages
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Admin pages
import Dashboard from './pages/admin/Dashboard.jsx';
import ManageProducts from './pages/admin/ManageProducts.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import ManageCategories from './pages/admin/ManageCategories.jsx';
import ManageOrders from './pages/admin/ManageOrders.jsx';

const App = () => {
  return (
    <Routes>
      {/* Storefront routes share the main Layout (Navbar/Footer). */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated customer routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>
      </Route>

      {/* Admin routes are guarded and use the AdminLayout. */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="orders" element={<ManageOrders />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<h1>404 — Page Not Found</h1>} />
    </Routes>
  );
};

export default App;
