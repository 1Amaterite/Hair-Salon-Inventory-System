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
        return 'bg-primary-fixed text-on-primary-fixed';
      case 'OUTBOUND':
        return 'bg-error-container text-on-error-container';
      case 'USAGE':
        return 'bg-tertiary-fixed text-on-tertiary-fixed';
      case 'ADJUSTMENT':
        return 'bg-secondary-fixed text-on-secondary-fixed';
      default:
        return 'bg-surface-container-highest text-on-surface-variant';
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
          <div className="font-h3 text-h3 text-on-surface-variant">Loading transactions...</div>
        </div>
      </SideNavigation>
    );
  }

  return (
    <SideNavigation title="Recent Transactions" configType="with-recent">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-xl">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex justify-center mb-lg">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-on-primary">history</span>
              </div>
            </div>
            <h2 className="font-h1 text-h1 text-on-background mb-md">
              Recent Transactions
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              View your recent inventory movements and adjustments
            </p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container px-lg py-md rounded-lg border border-error font-body-md mb-lg">
              {error}
            </div>
          )}

          {/* Transactions Table */}
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-lg py-xl">
              <h3 className="font-h2 text-h2 text-on-background mb-lg">
                Transaction History
              </h3>
              
              {transactions.length === 0 ? (
                <div className="text-center py-xl">
                  <div className="text-on-surface-variant font-body-md">
                    No transactions found
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-outline-variant">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                            Product
                          </div>
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
                      {transactions.map((Transaction) => (
                        <tr key={Transaction.id} className="hover:bg-surface-container-low">
                          <td className="px-lg py-md whitespace-nowrap font-body-md text-body-md text-on-background">
                            {formatDate(Transaction.createdAt)}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <div>
                              <div className="font-body-md text-body-md text-on-background">
                                {Transaction.product.name}
                              </div>
                              <div className="font-body-sm text-body-sm text-on-surface-variant">
                                {Transaction.product.sku}
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <span className={`inline-flex px-md py-sm font-label-md font-label-md rounded-full ${getTransactionTypeColor(Transaction.type)}`}>
                              {Transaction.type}
                            </span>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap font-body-md text-body-md text-on-background">
                            <span className={`font-medium ${
                              Transaction.type === 'INBOUND' ? 'text-primary' : 
                              Transaction.type === 'OUTBOUND' || Transaction.type === 'USAGE' ? 'text-error' : 
                              'text-tertiary'
                            }`}>
                              {Transaction.type === 'INBOUND' ? '+' : '-'}{Math.abs(Transaction.quantity)}
                            </span>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap font-body-md text-body-md text-on-background">
                            {Transaction.user.name}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap font-body-sm text-body-sm text-on-surface-variant">
                            {Transaction.remarks || '-'}
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
