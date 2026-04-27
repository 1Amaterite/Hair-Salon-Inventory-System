import React, { useState, useEffect, useRef } from 'react';
import { productsApi, Product } from '../api/products';
import SideNavigation from '../components/SideNavigation';
import { Package, AlertTriangle, CheckCircle, Search, ArrowUpDown, Box, DollarSign, Tag, XCircle } from 'lucide-react';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts(false); // Initial load, not search
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(true); // This is a search operation
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, sortBy, sortOrder]);

  // Restore focus after search results update
  useEffect(() => {
    if (isSearchFocused && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [products, isSearchFocused]);

  const fetchProducts = async (isSearch = false) => {
    try {
      // Only set loading to true for initial load, not for search
      if (!isSearch) {
        setLoading(true);
      }
      const params: any = { isActive: true };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      // Debug logging
      console.log('Fetching products with params:', params);
      
      const response = await productsApi.getProducts(params);
      console.log('Products response:', response);
      
      if (response.success) {
        let sortedProducts = [...response.data];
        
        // Client-side sorting for all fields to ensure it works
        sortedProducts.sort((a: Product, b: Product) => {
          let aValue: any, bValue: any;
          
          switch (sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'sku':
              aValue = a.sku.toLowerCase();
              bValue = b.sku.toLowerCase();
              break;
            case 'category':
              aValue = a.category.toLowerCase();
              bValue = b.category.toLowerCase();
              break;
            case 'currentStock':
              aValue = a.currentStock;
              bValue = b.currentStock;
              break;
            case 'retailPrice':
              aValue = Number(a.retailPrice);
              bValue = Number(b.retailPrice);
              break;
            default:
              return 0;
          }
          
          if (sortOrder === 'asc') {
            if (typeof aValue === 'string') {
              return aValue.localeCompare(bValue);
            } else {
              return aValue - bValue;
            }
          } else {
            if (typeof aValue === 'string') {
              return bValue.localeCompare(aValue);
            } else {
              return bValue - aValue;
            }
          }
        });
        
        console.log('Sorted products:', sortedProducts);
        setProducts(sortedProducts);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      if (!isSearch) {
        setLoading(false);
      }
    }
  };

  
  if (loading) {
    return (
      <SideNavigation title="Products" configType="with-recent">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
                
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reorder Threshold (Low Stock)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Retail Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...Array(6)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 bg-gray-200 rounded w-12"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SideNavigation>
    );
  }

  return (
    <SideNavigation title="Products" configType="with-recent">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {searchQuery ? `No products found for "${searchQuery}"` : 'No products found'}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Inventory Products
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split('-');
                          setSortBy(newSortBy);
                          setSortOrder(newSortOrder as 'asc' | 'desc');
                        }}
                        className="block w-48 pl-10 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="sku-asc">SKU (A-Z)</option>
                        <option value="sku-desc">SKU (Z-A)</option>
                        <option value="category-asc">Category (A-Z)</option>
                        <option value="category-desc">Category (Z-A)</option>
                        <option value="currentStock-asc">Stock (Low to High)</option>
                        <option value="currentStock-desc">Stock (High to Low)</option>
                        <option value="retailPrice-asc">Price (Low to High)</option>
                        <option value="retailPrice-desc">Price (High to Low)</option>
                      </select>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Product
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            SKU
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Box className="w-4 h-4" />
                            Current Stock
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Reorder Threshold
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Retail Price
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              {product.size && product.variant && (
                                <div className="text-sm text-gray-500">
                                  {product.size} - {product.variant}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-semibold rounded-full ${
                              product.currentStock <= product.reorderThreshold 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              <Box className="w-3 h-3" />
                              {product.currentStock}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.reorderThreshold}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₱{Number(product.retailPrice).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                              product.currentStock === 0
                                ? 'bg-red-100 text-red-800'
                                : product.isLowStock
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {product.currentStock === 0 ? (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  Out of Stock
                                </>
                              ) : product.isLowStock ? (
                                <>
                                  <AlertTriangle className="w-3 h-3" />
                                  Low Stock
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  In Stock
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SideNavigation>
  );
};

export default Products;
