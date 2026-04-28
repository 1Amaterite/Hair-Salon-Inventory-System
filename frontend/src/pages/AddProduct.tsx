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
    <SideNavigation configType="with-recent">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-xl">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex justify-center mb-lg">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-on-primary">add_circle</span>
              </div>
            </div>
            <h2 className="font-h1 text-h1 text-on-background mb-md">
              Add New Product
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Create a new product for your salon inventory
            </p>
          </div>

          {/* Product Form */}
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm p-xl">
            <form onSubmit={handleSubmit} className="space-y-lg">
              {message && (
                <div className={`p-md rounded-lg border font-body-md flex items-center gap-sm ${
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

              <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
                {/* SKU */}
                <div>
                  <label htmlFor="sku" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">tag</span>
                      SKU *
                    </div>
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={productData.sku}
                    onChange={handleChange}
                    required
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                    placeholder="e.g., SHAM-001"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">inventory_2</span>
                      Product Name *
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={productData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                    placeholder="e.g., Premium Shampoo"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={productData.category}
                    onChange={handleChange}
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background focus:border-primary focus:outline-none transition-colors font-body-md"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label htmlFor="size" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                    Size (optional)
                  </label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={productData.size}
                    onChange={handleChange}
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                    placeholder="e.g., 500ml"
                  />
                </div>

                {/* Variant */}
                <div>
                  <label htmlFor="variant" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                    Variant (optional)
                  </label>
                  <input
                    type="text"
                    id="variant"
                    name="variant"
                    value={productData.variant}
                    onChange={handleChange}
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                    placeholder="e.g., Dry Hair"
                  />
                </div>

                {/* Wholesale Cost */}
                <div>
                  <label htmlFor="wholesaleCost" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">payments</span>
                      Wholesale Cost ($) *
                    </div>
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
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                    placeholder="0.00"
                  />
                </div>

                {/* Retail Price */}
                <div>
                  <label htmlFor="retailPrice" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">sell</span>
                      Retail Price ($) *
                    </div>
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
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                    placeholder="0.00"
                  />
                  {productData.retailPrice > 0 && productData.wholesaleCost > 0 && 
                   productData.retailPrice <= productData.wholesaleCost && (
                    <p className="mt-sm text-sm text-error flex items-center gap-sm">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Retail price must be greater than wholesale cost
                    </p>
                  )}
                </div>

                {/* Reorder Threshold */}
                <div>
                  <label htmlFor="reorderThreshold" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Reorder Threshold *
                    </div>
                  </label>
                  <input
                    type="number"
                    id="reorderThreshold"
                    name="reorderThreshold"
                    value={productData.reorderThreshold || ''}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                    placeholder="0"
                  />
                </div>

                {/* Lead Time Days */}
                <div>
                  <label htmlFor="leadTimeDays" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      Lead Time (days) *
                    </div>
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
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                    placeholder="0"
                  />
                </div>

                </div>

              <div className="pt-lg">
                <button
                  type="submit"
                  disabled={loading || !productData.sku || !productData.name || 
                           productData.retailPrice <= productData.wholesaleCost}
                  className="w-full py-md font-body-md bg-primary text-on-primary rounded-lg hover:bg-primary-container hover:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-sm"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">add_circle</span>
                      Create Product
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

export default AddProduct;
