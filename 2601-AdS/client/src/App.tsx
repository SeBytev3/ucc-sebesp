import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Categories from './pages/Categories';
import ProviderList from './pages/ProviderList';
import ProviderDetail from './pages/ProviderDetail';
import AdminDashboard from './pages/AdminDashboard';
import CompleteProfile from './pages/CompleteProfile';
import ProfilePending from './pages/ProfilePending';
import MyRequests from './pages/MyRequests';
import Home from './pages/Home';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

        {/* Rutas Protegidas */}
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />

        <Route
          path="/categories"
          element={
            isAuthenticated && user?.role !== 'PROVIDER' ? <Categories /> : <Navigate to="/" />
          }
        />

        <Route
          path="/categories/:categoryId/providers"
          element={
            isAuthenticated && user?.role !== 'PROVIDER' ? <ProviderList /> : <Navigate to="/" />
          }
        />

        <Route
          path="/providers/:id"
          element={isAuthenticated ? <ProviderDetail /> : <Navigate to="/login" />}
        />

        <Route
          path="/requests"
          element={isAuthenticated ? <MyRequests /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />
          }
        />

        <Route
          path="/complete-profile"
          element={
            isAuthenticated && user?.role === 'PROVIDER' ? <CompleteProfile /> : <Navigate to="/" />
          }
        />

        <Route
          path="/profile-pending"
          element={isAuthenticated ? <ProfilePending /> : <Navigate to="/login" />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
