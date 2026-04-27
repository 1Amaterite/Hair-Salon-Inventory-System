import React, { useState, useEffect } from 'react';
import { productsApi, Product } from '../api/products';
import Navbar from '../components/Navbar';
import { useUser } from '../contexts/UserContext';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getProducts({ isActive: true });
      if (response.success) {
        setProducts(response.data);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        title="Products"
        showAddProduct={true}
        showNewTransaction={true}
      />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No products found</div>
              <div className="text-gray-400 mt-2">Products will appear here once they are added to the system.</div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                  <li key={product.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {product.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                {product.isLowStock && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Low Stock
                                  </span>
                                )}
                              </div>
                              <div className="mt-1">
                                <p className="text-sm text-gray-500">
                                  SKU: {product.sku} | Category: {product.category}
                                  {product.size && ` | Size: ${product.size}`}
                                  {product.variant && ` | Variant: ${product.variant}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-6 flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {product.currentStock}
                            </div>
                            <div className="text-sm text-gray-500">units in stock</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              ${product.retailPrice}
                            </div>
                            <div className="text-xs text-gray-500">retail</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Wholesale: ${product.wholesaleCost}</span>
                          <span>Reorder at: {product.reorderThreshold}</span>
                          <span>Lead time: {product.leadTimeDays} days</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
