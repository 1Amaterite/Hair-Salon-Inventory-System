import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Transactions from './pages/Transactions';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
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
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/transactions" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
