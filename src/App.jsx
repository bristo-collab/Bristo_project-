import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import { Suspense } from 'react';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Checkout from './pages/Checkout';
import SearchResults from './pages/SearchResults';
import CategoryPage from './pages/CategoryPage';
import BrandPage from './pages/BrandPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import ProductDetails from './pages/ProductDetails';
import MySubscriptions from './pages/MySubscriptions';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetails from './pages/AdminOrderDetails';
import AdminUsers from './pages/AdminUsers';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminLogin from './pages/AdminLogin';
import ArticleDetail from './pages/ArticleDetail';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <AuthProvider>
            <ToastProvider>
              <SocketProvider>
                <CartProvider>
                  <SubscriptionProvider>
                    <OrderProvider>
                      <WishlistProvider>
                        <div className="app">
                          <Navbar />
                          <Routes>
                            <Route path="/admin-login" element={<AdminLogin />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/login" element={<SignIn />} />

                            {/* Protected Routes */}
                            <Route path="/checkout" element={
                              <ProtectedRoute>
                                <Checkout />
                              </ProtectedRoute>
                            } />
                            <Route path="/cart" element={
                              <ProtectedRoute>
                                <CartPage />
                              </ProtectedRoute>
                            } />
                            <Route path="/wishlist" element={
                              <ProtectedRoute>
                                <WishlistPage />
                              </ProtectedRoute>
                            } />
                            <Route path="/product/:productId" element={<ProductDetails />} />
                            <Route path="/my-subscriptions" element={
                              <ProtectedRoute>
                                <MySubscriptions />
                              </ProtectedRoute>
                            } />
                            <Route path="/my-orders" element={
                              <ProtectedRoute>
                                <OrderHistory />
                              </ProtectedRoute>
                            } />
                            <Route path="/my-account" element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            } />

                            {/* Admin Routes */}
                            <Route path="/admin-dashboard" element={
                              <ProtectedRoute adminOnly={true}>
                                <AdminLayout />
                              </ProtectedRoute>
                            }>
                              <Route index element={<AdminDashboard />} />
                              <Route path="products" element={<AdminProducts />} />
                              <Route path="orders" element={<AdminOrders />} />
                              <Route path="orders/:id" element={<AdminOrderDetails />} />
                              <Route path="users" element={<AdminUsers />} />
                              <Route path="subscriptions" element={<AdminSubscriptions />} />
                              <Route path="analytics" element={<AdminAnalytics />} />
                            </Route>

                            {/* Public Routes */}
                            <Route path="/search" element={<SearchResults />} />
                            <Route path="/category/:categorySlug" element={<CategoryPage />} />
                            <Route path="/brand/:brandName" element={<BrandPage />} />
                            <Route path="/article/:id" element={<ArticleDetail />} />
                          </Routes>
                          <Footer />
                        </div>
                      </WishlistProvider>
                    </OrderProvider>
                  </SubscriptionProvider>
                </CartProvider>
              </SocketProvider>
            </ToastProvider>
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
