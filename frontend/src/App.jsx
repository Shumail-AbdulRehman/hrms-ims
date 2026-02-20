import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Units from './pages/Units';
import Personnel from './pages/Personnel';
import Vendors from './pages/Vendors';
import Inventory from './pages/Inventory';
import StockIn from './pages/StockIn';
import StockRequests from './pages/StockRequests';
import MyRequests from './pages/MyRequests';
import StockReturns from './pages/StockReturns';
import StockHistory from './pages/StockHistory';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="units" element={<Units />} />
            <Route path="personnel" element={<Personnel />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="stock-in" element={<StockIn />} />
            <Route path="stock-requests" element={<StockRequests />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="stock-returns" element={<StockReturns />} />
            <Route path="stock-history" element={<StockHistory />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
