/**
 * Main App Component
 * Sets up routing, context providers, and global configuration
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';
import { ROUTES } from '@/config/constants';

// Layouts
import MainLayout from '@/components/Layout/MainLayout';

// Public Pages
import Home from '@/pages/Home';
import About from '@/pages/About';
import BlogList from '@/pages/BlogList';
import BlogDetail from '@/pages/BlogDetail';
import Portfolio from '@/pages/Portfolio';
import Contact from '@/pages/Contact';

// Admin Pages
import AdminLogin from '@/pages/Admin/Login';
import AdminDashboard from '@/pages/Admin/Dashboard';
import AdminPostList from '@/pages/Admin/PostList';
import AdminPostEditor from '@/pages/Admin/PostEditor';
import AdminLayout from '@/components/Layout/AdminLayout';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter basename="" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route
                path={ROUTES.HOME}
                element={
                  <MainLayout>
                    <Home />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.ABOUT}
                element={
                  <MainLayout>
                    <About />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.BLOG}
                element={
                  <MainLayout>
                    <BlogList />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.BLOG_DETAIL}
                element={
                  <MainLayout>
                    <BlogDetail />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.PORTFOLIO}
                element={
                  <MainLayout>
                    <Portfolio />
                  </MainLayout>
                }
              />
              <Route
                path={ROUTES.CONTACT}
                element={
                  <MainLayout>
                    <Contact />
                  </MainLayout>
                }
              />

              {/* Admin Routes */}
              <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
              
              <Route
                path={ROUTES.ADMIN_DASHBOARD}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_POSTS}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminPostList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_POST_NEW}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminPostEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_POST_EDIT}
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminPostEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>

            {/* Toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

