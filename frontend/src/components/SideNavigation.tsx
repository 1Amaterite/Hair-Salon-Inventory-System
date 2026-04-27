import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getNavbarConfig } from '../utils/navbarConfig';

interface SideNavigationProps {
  title: string;
  configType?: 'standard' | 'without-recent' | 'with-recent';
  children: React.ReactNode;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ title, configType = 'standard', children }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  const config = getNavbarConfig(configType);

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

  const handleReports = () => {
    navigate('/admin/reports');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      key: 'transactions',
      label: 'Create Transaction',
      onClick: handleNewTransaction,
      show: config.showNewTransaction,
      active: isActiveRoute('/transactions')
    },
    {
      key: 'products',
      label: 'Products',
      onClick: handleViewProducts,
      show: config.showViewProducts,
      active: isActiveRoute('/products')
    },
    {
      key: 'add-product',
      label: 'Add Product',
      onClick: handleAddProduct,
      show: config.showAddProduct && user?.role === 'ADMIN',
      active: isActiveRoute('/products/add')
    },
    {
      key: 'reports',
      label: 'Reports',
      onClick: handleReports,
      show: config.showReports && user?.role === 'ADMIN',
      active: isActiveRoute('/admin/reports')
    },
    {
      key: 'recent-transactions',
      label: 'Recent Transactions',
      onClick: handleRecentTransactions,
      show: config.showRecentTransactions,
      active: isActiveRoute('/transactions/recent')
    }
  ].filter(item => item.show);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Alpha 8 Logo" 
              className="h-12 w-12 rounded-lg object-contain"
            />
            <h1 className="text-xl font-bold text-gray-900">Alpha 8</h1>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={item.onClick}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                item.active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user.role}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SideNavigation;
