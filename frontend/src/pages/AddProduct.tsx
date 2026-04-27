import React, { useState } from 'react';
import { productsApi, CreateProductRequest } from '../api/products';
import SideNavigation from '../components/SideNavigation';

const AddProduct: React.FC = () => {
  const [productData, setProductData] = useState<CreateProductRequest>({
    sku: '',
    name: '',
    category: 'Hair Care',
    size: '',
    variant: '',
    wholesaleCost: 0,
    retailPrice: 0,
    reorderThreshold: 0,
    leadTimeDays: 0,
    initialStock: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    'Hair Care',
    'Coloring', 
    'Styling',
    'Treatment',
    'Tools',
    'Accessories'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await productsApi.createProduct(productData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Product created successfully!' });
        // Reset form
        setProductData({
          sku: '',
          name: '',
          category: 'Hair Care',
          size: '',
          variant: '',
          wholesaleCost: 0,
          retailPrice: 0,
          reorderThreshold: 0,
          leadTimeDays: 0,
        });
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setProductData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  
  return (
    <SideNavigation title="Add New Product" configType="with-recent">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                  <div className={`p-3 rounded ${
                    message.type === 'success' 
                      ? 'bg-green-100 border border-green-400 text-green-700' 
                      : 'bg-red-100 border border-red-400 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* SKU */}
                  <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                      SKU *
                    </label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={productData.sku}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., SHAM-001"
                    />
                  </div>

                  {/* Product Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={productData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., Premium Shampoo"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={productData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Size */}
                  <div>
                    <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                      Size (optional)
                    </label>
                    <input
                      type="text"
                      id="size"
                      name="size"
                      value={productData.size}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., 500ml"
                    />
                  </div>

                  {/* Variant */}
                  <div>
                    <label htmlFor="variant" className="block text-sm font-medium text-gray-700">
                      Variant (optional)
                    </label>
                    <input
                      type="text"
                      id="variant"
                      name="variant"
                      value={productData.variant}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., Dry Hair"
                    />
                  </div>

                  {/* Wholesale Cost */}
                  <div>
                    <label htmlFor="wholesaleCost" className="block text-sm font-medium text-gray-700">
                      Wholesale Cost ($) *
                    </label>
                    <input
                      type="number"
                      id="wholesaleCost"
                      name="wholesaleCost"
                      value={productData.wholesaleCost || ''}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Retail Price */}
                  <div>
                    <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-700">
                      Retail Price ($) *
                    </label>
                    <input
                      type="number"
                      id="retailPrice"
                      name="retailPrice"
                      value={productData.retailPrice || ''}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0.00"
                    />
                    {productData.retailPrice > 0 && productData.wholesaleCost > 0 && 
                     productData.retailPrice <= productData.wholesaleCost && (
                      <p className="mt-1 text-sm text-red-500">
                        Retail price must be greater than wholesale cost
                      </p>
                    )}
                  </div>

                  {/* Reorder Threshold */}
                  <div>
                    <label htmlFor="reorderThreshold" className="block text-sm font-medium text-gray-700">
                      Reorder Threshold *
                    </label>
                    <input
                      type="number"
                      id="reorderThreshold"
                      name="reorderThreshold"
                      value={productData.reorderThreshold || ''}
                      onChange={handleChange}
                      required
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0"
                    />
                  </div>

                  {/* Lead Time Days */}
                  <div>
                    <label htmlFor="leadTimeDays" className="block text-sm font-medium text-gray-700">
                      Lead Time (days) *
                    </label>
                    <input
                      type="number"
                      id="leadTimeDays"
                      name="leadTimeDays"
                      value={productData.leadTimeDays || ''}
                      onChange={handleChange}
                      required
                      min="0"
                      max="365"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0"
                    />
                  </div>

                  {/* Initial Stock */}
                  <div>
                    <label htmlFor="initialStock" className="block text-sm font-medium text-gray-700">
                      Initial Stock Quantity
                    </label>
                    <input
                      type="number"
                      id="initialStock"
                      name="initialStock"
                      value={productData.initialStock || ''}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Optional: Set initial stock quantity for this product
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !productData.sku || !productData.name || 
                             productData.retailPrice <= productData.wholesaleCost}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Product'}
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

export default AddProduct;
