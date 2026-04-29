import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  Scissors 
} from 'lucide-react';
import SideNavigation from '../components/SideNavigation';

// Transaction types with icons and descriptions
const TRANSACTION_TYPES = [
  {
    type: 'INBOUND',
    label: 'Inbound',
    description: 'Receive stock from suppliers',
    icon: Package,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600'
  },
  {
    type: 'OUTBOUND',
    label: 'Outbound',
    description: 'Send orders to clients',
    icon: Truck,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  {
    type: 'USAGE',
    label: 'Salon Usage',
    description: 'Products used in salon services',
    icon: Scissors,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  }
];

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleTransactionTypeSelect = (type: string) => {
    // Navigate to transactions page with state to pre-select the transaction type
    navigate('/transactions', { state: { preselectedType: type } });
  };

  return (
    <SideNavigation configType="with-recent">
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
            <p className="text-gray-600">Quick Actions for Inventory Management</p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRANSACTION_TYPES.map(({ type, label, description, icon: Icon, color, hoverColor }) => (
              <button
                key={type}
                onClick={() => handleTransactionTypeSelect(type)}
                className={`p-8 rounded-xl border-2 border-gray-200 transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${hoverColor} text-white group`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-20 h-20 ${color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">{label}</h2>
                    <p className="text-sm opacity-90">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Additional Quick Actions */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Other Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/transactions/recent')}
                className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <span className="text-lg font-medium text-gray-700">View Recent Transactions</span>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/staff/active-orders')}
                className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">📦</span>
                  <span className="text-lg font-medium text-gray-700">Active Orders</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </SideNavigation>
  );
};

export default StaffDashboard;
