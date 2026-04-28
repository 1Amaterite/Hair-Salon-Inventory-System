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
      <div className="max-w-2xl mx-auto">
        <div className="space-y-xl">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex justify-center mb-lg">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-on-primary">add_shopping_cart</span>
              </div>
            </div>
            <h2 className="font-h1 text-h1 text-on-background mb-md">
              New Transaction
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Record inventory movement for your salon products
            </p>
          </div>

          {/* Transaction Form */}
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm p-xl">
            {message && (
              <div className={`mb-lg p-md rounded-lg border font-body-md flex items-center gap-sm ${
                message.type === 'success' 
                  ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed-dim' 
                  : 'bg-error-container text-on-error-container border-error'
              }`}>
                <span className="material-symbols-outlined">
                  {message.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-lg">
              {/* Product Selection */}
              <div>
                <label htmlFor="product" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                  Product *
                </label>
                <select
                  id="product"
                  name="product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                  disabled={fetchingProducts}
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label htmlFor="type" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                  Transaction Type *
                </label>
                <div className="grid grid-cols-3 gap-sm">
                  {[
                    { value: 'INBOUND', label: 'Stock In', icon: 'inventory_2', color: 'primary' },
                    { value: 'OUTBOUND', label: 'Sales', icon: 'sell', color: 'tertiary' },
                    { value: 'USAGE', label: 'Services', icon: 'content_cut', color: 'secondary' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setTransactionType(type.value as any)}
                      disabled={fetchingProducts}
                      className={`p-md rounded-lg border transition-all duration-200 ${
                        transactionType === type.value
                          ? `bg-${type.color} text-on-${type.color} border-${type.color}`
                          : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className="material-symbols-outlined block mb-xs">{type.icon}</span>
                      <span className="font-body-sm text-body-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
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
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Remarks */}
              <div>
                <label htmlFor="remarks" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                  Remarks (optional)
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  disabled={fetchingProducts}
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  placeholder="Add any notes about this transaction"
                />
              </div>

              {/* Stock Preview */}
              {selectedProductData && (
                <div className="bg-surface-container-low p-lg rounded-lg border border-outline-variant">
                  <h3 className="font-h3 text-h3 text-on-background mb-md flex items-center gap-sm">
                    <span className="material-symbols-outlined">analytics</span>
                    Stock Preview
                  </h3>
                  <div className="space-y-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-body-md text-body-md text-on-surface-variant">Current Stock:</span>
                      <span className="font-body-lg text-body-lg text-on-background font-medium">{selectedProductData.currentStock}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-body-md text-body-md text-on-surface-variant">After Transaction:</span>
                      <span className={`font-body-lg text-body-lg font-medium ${
                        transactionType === 'INBOUND' 
                          ? 'text-primary' 
                          : selectedProductData.currentStock - parseInt(quantity || '0') < 0 
                            ? 'text-error' 
                            : 'text-on-background'
                      }`}>
                        {transactionType === 'INBOUND' 
                          ? selectedProductData.currentStock + parseInt(quantity || '0')
                          : selectedProductData.currentStock - parseInt(quantity || '0')
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-md">
                <button
                  type="submit"
                  disabled={loading || fetchingProducts || !selectedProduct || !quantity}
                  className="w-full py-md font-body-md bg-primary text-on-primary rounded-lg hover:bg-primary-container hover:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-sm"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      Creating Transaction...
                    </>
                  ) : fetchingProducts ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      Loading Products...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">check_circle</span>
                      Create Transaction
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SideNavigation>
  );
};

export default Transactions;
