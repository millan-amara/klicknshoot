import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Layouts
import MainLayout from './components/layout/MainLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'

// Context Providers
import { AuthProvider } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { NotificationProvider } from './contexts/NotificationContext'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Public Pages
import Home from './pages/Home'
import BrowseCreatives from './pages/marketplace/BrowseCreatives'
import CreativeProfile from './pages/marketplace/CreativeProfile'
import BrowseRequests from './pages/marketplace/BrowseRequests'
import RequestDetails from './pages/marketplace/RequestDetails'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'

// // Creative Dashboard Pages
import CreativeDashboard from './pages/dashboard/creative/Dashboard'
import CreativeProfileEdit from './pages/dashboard/creative/Profile'
import CreativeProposals from './pages/dashboard/creative/Proposals'
import CreativePortfolio from './pages/dashboard/creative/Portfolio'

// // Client Dashboard Pages
import ClientDashboard from './pages/dashboard/client/Dashboard'
import ClientProfile from './pages/dashboard/client/Profile'
import ClientRequests from './pages/dashboard/client/Requests'
import PostRequest from './pages/dashboard/client/PostRequest'

import Scroll from './components/ui/Scroll';

// // Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminVerifications from './pages/admin/Verifications'
import AdminUsers from './pages/admin/Users'
import AdminSubscriptions from './pages/admin/Subscriptions'
import AdminAnalytics from './pages/admin/Analytics'

// // Payment Pages
import Checkout from './pages/payment/Checkout'
import PaymentSuccess from './pages/payment/Success'
import PaymentCancel from './pages/payment/Cancel'

// // Protected Route Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleBasedRoute from './components/auth/RoleBasedRoute'

// // 404 Page
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <UserProvider>
            <SubscriptionProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <Scroll />
              <Routes>
                {/* Public Routes with Main Layout */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="creatives" element={<BrowseCreatives />} />
                  <Route path="creatives/:id" element={<CreativeProfile />} />
                  <Route path="requests" element={<BrowseRequests />} />
                  <Route path="requests/:id" element={<RequestDetails />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  
                  {/* Auth Routes */}
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password/:token" element={<ResetPassword />} />
                </Route>

                {/* Protected Creative Dashboard Routes */}
                <Route 
                  path="/dashboard/creative" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['creative']}>
                        <DashboardLayout />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CreativeDashboard />} />
                  <Route path="profile" element={<CreativeProfileEdit />} />
                  <Route path="proposals" element={<CreativeProposals />} />
                  <Route path="portfolio" element={<CreativePortfolio />} />
                </Route>

                {/* Protected Client Dashboard Routes */}
                <Route 
                  path="/dashboard/client" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['client']}>
                        <DashboardLayout />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ClientDashboard />} />
                  <Route path="profile" element={<ClientProfile />} />
                  <Route path="requests" element={<ClientRequests />} />
                  <Route path="requests/new" element={<PostRequest />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="verifications" element={<AdminVerifications />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="subscriptions" element={<AdminSubscriptions />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                {/* Payment Routes */}
                <Route path="/checkout/:plan" element={<Checkout />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SubscriptionProvider>
          </UserProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  )
}

export default App