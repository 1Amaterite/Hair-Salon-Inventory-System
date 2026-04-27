import React, { useState, useEffect } from 'react';
import { productsApi, Product } from '../api/products';
import { transactionsApi, CreateTransactionRequest } from '../api/transactions';
import SideNavigation from '../components/SideNavigation';

const Transactions: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [transactionType, setTransactionType] = useState<'INBOUND' | 'OUTBOUND' | 'USAGE'>('INBOUND');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fetchingProducts, setFetchingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getProducts({ isActive: true });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setMessage({ type: 'error', text: 'Failed to load products' });
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity) {
      setMessage({ type: 'error', text: 'Please select a product and enter quantity' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const transactionData: CreateTransactionRequest = {
        productId: selectedProduct,
        type: transactionType,
        quantity: transactionType === 'INBOUND' ? Math.abs(Number(quantity)) : -Math.abs(Number(quantity)),
        remarks: remarks || undefined,
      };

      const response = await transactionsApi.createTransaction(transactionData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Transaction created successfully!' });
        // Reset form
        setSelectedProduct('');
        setQuantity('');
        setRemarks('');
        setTransactionType('INBOUND');
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create transaction' });
    } finally {
      setLoading(false);
    }
  };

  
  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <SideNavigation title="Create Transaction" configType="with-recent">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-md mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">New Transaction</h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded ${
                  message.type === 'success' 
                    ? 'bg-green-100 border border-green-400 text-green-700' 
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                    Product *
                  </label>
                  <select
                    id="product"
                    name="product"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    required
                    disabled={fetchingProducts}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku}) - Stock: {product.currentStock}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transaction Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Transaction Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as 'INBOUND' | 'OUTBOUND' | 'USAGE')}
                    disabled={fetchingProducts}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="INBOUND">Inbound (Stock In)</option>
                    <option value="OUTBOUND">Outbound (Sales)</option>
                    <option value="USAGE">Usage (Services)</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    min="1"
                    disabled={fetchingProducts}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter quantity"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                    Remarks (optional)
                  </label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    disabled={fetchingProducts}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Add any notes about this transaction"
                  />
                </div>

                {/* Stock Preview */}
                {selectedProductData && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">
                      <p>Current Stock: <span className="font-medium">{selectedProductData.currentStock}</span></p>
                      <p>After Transaction: <span className="font-medium">
                        {transactionType === 'INBOUND' 
                          ? selectedProductData.currentStock + parseInt(quantity || '0')
                          : selectedProductData.currentStock - parseInt(quantity || '0')
                        }
                      </span></p>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || fetchingProducts || !selectedProduct || !quantity}
                    className="flex-1 max-w-md bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : fetchingProducts ? 'Loading Products...' : 'Create Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SideNavigation>
  );
};

export default Transactions;
