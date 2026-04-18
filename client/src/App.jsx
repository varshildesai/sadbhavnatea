import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';
import PaymentSuccess from './pages/PaymentSuccess';
import Wishlist from './pages/Wishlist';
import MyOrders from './pages/MyOrders';
import Invoice from './pages/Invoice';
import ScrollToTop from './components/layout/ScrollToTop';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminReviews from './pages/admin/Reviews';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import UserProtectedRoute from './components/layout/UserProtectedRoute';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Toaster } from 'react-hot-toast';
import MiniCartDrawer from './components/ui/MiniCartDrawer';
import FirstVisitModal from './components/ui/FirstVisitModal';
import InactiveReminder from './components/ui/InactiveReminder';

function App() {
  return (
    <AuthProvider>
    <UIProvider>
    <CartProvider>
      <PayPalScriptProvider options={{ 'client-id': 'test', currency: 'USD' }}>
      <Toaster position="top-center" />
      <Router>
        <ScrollToTop />
        <MiniCartDrawer />
        <FirstVisitModal />
        <InactiveReminder />
      <Routes>
        {/* Admin Routes with Layout */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="reviews" element={<AdminReviews />} />
            {/* We can add categories, media here later */}
          </Route>
        </Route>

        {/* User Routes with Main Layout */}
        <Route path="/*" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/category/:categoryId" element={<Products />} />
                <Route path="/categories" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                
                <Route element={<UserProtectedRoute />}>
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/invoice/:orderId" element={<Invoice />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/success" element={<AuthSuccess />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
    </PayPalScriptProvider>
    </CartProvider>
    </UIProvider>
    </AuthProvider>
  );
}

export default App;
