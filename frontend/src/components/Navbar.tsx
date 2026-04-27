import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface NavbarProps {
  title: string;
  showViewProducts?: boolean;
  showNewTransaction?: boolean;
  showAddProduct?: boolean;
  showRecentTransactions?: boolean;
  onBackClick?: () => void;
  backText?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  title, 
  showViewProducts = false, 
  showNewTransaction = false, 
  showAddProduct = false,
  showRecentTransactions = false,
  onBackClick,
  backText
}) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleViewProducts = () => {
    navigate('/products');
  };

  const handleNewTransaction = () => {
    navigate('/transactions');
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleRecentTransactions = () => {
    navigate('/transactions/recent');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {onBackClick && (
              <button
                onClick={onBackClick}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                ← {backText || 'Back'}
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Action Buttons - Role-based */}
            <div className="flex space-x-3">
              {/* Staff can view products */}
              {showViewProducts && (
                <button
                  onClick={handleViewProducts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Products
                </button>
              )}
              
              {/* Staff can create transactions */}
              {showNewTransaction && (
                <button
                  onClick={handleNewTransaction}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  New Transaction
                </button>
              )}
              
              {/* Only Admin can add products */}
              {showAddProduct && user?.role === 'ADMIN' && (
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Product
                </button>
              )}
              
              {/* Recent Transactions */}
              {showRecentTransactions && (
                <button
                  onClick={handleRecentTransactions}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Recent Transactions
                </button>
              )}
            </div>
            
            {/* User Info - Simple Version */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Simple Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
