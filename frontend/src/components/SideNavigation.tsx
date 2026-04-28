import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getNavbarConfig } from '../utils/navbarConfig';
import { Clock, LayoutDashboard, Package, Plus, Tag, MapPin } from 'lucide-react';

interface SideNavigationProps {
  configType?: 'standard' | 'without-recent' | 'with-recent';
  children: React.ReactNode;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ configType = 'standard', children }) => {
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

  const handleDestinations = () => {
    navigate('/admin/destinations');
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
      key: 'reports',
      label: 'Admin Dashboard',
      onClick: handleReports,
      show: config.showReports && user?.role === 'ADMIN',
      active: isActiveRoute('/admin/reports'),
      icon: LayoutDashboard
    },
    {
      key: 'destinations',
      label: 'Delivery Destinations',
      onClick: handleDestinations,
      show: user?.role === 'ADMIN',
      active: isActiveRoute('/admin/destinations'),
      icon: MapPin
    },
    {
      key: 'products',
      label: 'Products',
      onClick: handleViewProducts,
      show: config.showViewProducts,
      active: isActiveRoute('/products'),
      icon: Package
    },
    {
      key: 'add-product',
      label: 'Add Product',
      onClick: handleAddProduct,
      show: config.showAddProduct && user?.role === 'ADMIN',
      active: isActiveRoute('/products/add'),
      icon: Tag
    },
    {
      key: 'recent-transactions',
      label: 'Recent Transactions',
      onClick: handleRecentTransactions,
      show: config.showRecentTransactions,
      active: isActiveRoute('/transactions/recent'),
      icon: Clock
    }
  ].filter(item => item.show);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant shadow-xl flex flex-col">
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Alpha 8 Logo"
              className="h-10 w-10 rounded-lg object-contain border border-outline-variant"
            />
            <div>
              <h1 className="text-xl font-black text-primary leading-none">Alpha 8</h1>
              <p className="text-xs tracking-wide uppercase text-on-surface-variant mt-1">Inventory System</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                item.active
                  ? 'bg-primary-fixed-dim/20 text-primary border-l-4 border-primary rounded-r-md'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs tracking-wide uppercase">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-outline-variant space-y-1">
            <button
              onClick={handleLogout}
              className="w-full mt-2 px-4 py-2 text-sm text-error hover:text-on-error-container border border-outline-variant rounded-lg hover:bg-error-container/10"
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-6 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleNewTransaction}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-container transition-colors font-bold shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Create Transaction</span>
            </button>
            {user && (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-outline-variant">
                <div className="text-right">
                  <p className="text-xs font-bold text-on-surface">{user.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{user.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-outline-variant bg-surface-variant flex items-center justify-center">
                  <span className="text-on-surface text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SideNavigation;
