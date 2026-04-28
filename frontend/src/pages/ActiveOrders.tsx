import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, MapPin, Clock, CheckCircle, AlertCircle, Truck } from 'lucide-react';
import orderApi, { Order } from '../api/orderApi';
import SideNavigation from '../components/SideNavigation';

const ActiveOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getAllActiveOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.destination.fullAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.transaction.remarks && order.transaction.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      fetchOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status: ' + (error as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'IN_TRANSIT':
        return <Truck className="w-4 h-4" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExpectedDeliveryDate = (expectedDate?: string) => {
    if (!expectedDate) return 'Not set';
    return new Date(expectedDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SideNavigation configType="with-recent">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading active orders...</div>
        </div>
      </SideNavigation>
    );
  }

  return (
    <SideNavigation configType="with-recent">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
            <p className="text-gray-600 mt-1">Manage outbound deliveries and track shipment statuses</p>
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by order number, destination, or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
              <div className="text-sm text-gray-500">
                Showing {filteredOrders.length} of {orders.length} active orders
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                        {order.transaction && (
                          <div className="text-xs text-gray-400 mt-1">
                            Product: {order.transaction.product?.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.destination.name}</div>
                          <div className="text-xs text-gray-500">{order.destination.fullAddress}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getExpectedDeliveryDate(order.expectedDeliveryDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'No orders match your filters.'
                  : 'No active orders found.'}
              </div>
            </div>
          )}
        </div>

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h2>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Order: {selectedOrder.orderNumber}</p>
                  <p className="text-sm text-gray-600">Destination: {selectedOrder.destination.name}</p>
                </div>
                <div className="space-y-2">
                  {['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        selectedOrder.status === status
                          ? 'border-[#3D727A] bg-[#3D727A]/10 text-[#3D727A]'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className="font-medium">{status}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SideNavigation>
  );
};

export default ActiveOrders;
