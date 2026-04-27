import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Transactions from './pages/Transactions';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import RecentTransactions from './pages/RecentTransactions';
import Reports from './pages/Reports';
import { UserProvider } from './contexts/UserContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Only Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') {
      return <Navigate to="/products" replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products/add" 
              element={
                <AdminRoute>
                  <AddProduct />
                </AdminRoute>
              } 
            />
            <Route 
              path="/transactions/recent" 
              element={
                <ProtectedRoute>
                  <RecentTransactions />
                </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            }
          />
          <Route path="/" element={<Navigate to="/transactions" replace />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
