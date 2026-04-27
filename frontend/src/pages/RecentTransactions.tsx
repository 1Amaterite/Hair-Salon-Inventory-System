import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../api/transactions';
import SideNavigation from '../components/SideNavigation';

interface Transaction {
  id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'USAGE' | 'ADJUSTMENT';
  quantity: number;
  remarks?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  user: {
    id: string;
    name: string;
    username: string;
  };
}

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionsApi.getTransactions({ limit: 50 });
      if (response.success) {
        setTransactions(response.data);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'INBOUND':
        return 'text-green-600 bg-green-100';
      case 'OUTBOUND':
        return 'text-red-600 bg-red-100';
      case 'USAGE':
        return 'text-blue-600 bg-blue-100';
      case 'ADJUSTMENT':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  if (loading) {
    return (
      <SideNavigation title="Recent Transactions" configType="with-recent">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading transactions...</div>
        </div>
      </SideNavigation>
    );
  }

  return (
    <SideNavigation title="Recent Transactions" configType="with-recent">
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Transaction History
              </h3>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No transactions found</div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.product.sku}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`font-medium ${
                              transaction.type === 'INBOUND' ? 'text-green-600' : 
                              transaction.type === 'OUTBOUND' || transaction.type === 'USAGE' ? 'text-red-600' : 
                              'text-yellow-600'
                            }`}>
                              {transaction.type === 'INBOUND' ? '+' : '-'}{Math.abs(transaction.quantity)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.user.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {transaction.remarks || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SideNavigation>
  );
};

export default RecentTransactions;
