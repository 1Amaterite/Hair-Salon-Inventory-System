import React, { useState, useEffect, useRef } from 'react';
import { productsApi, Product } from '../api/products';
import SideNavigation from '../components/SideNavigation';

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
                <div className="flex items-center justify-between mb-lg">
                  <div className="h-6 bg-surface-container-highest rounded w-48 animate-pulse"></div>
                  <div className="h-10 bg-surface-container-highest rounded w-64 animate-pulse"></div>
                </div>
                
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-outline-variant">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                            Product
                          </div>
                        </th>
                        <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">tag</span>
                            SKU
                          </div>
                        </th>
                        <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">inventory</span>
                            Current Stock
                          </div>
                        </th>
                        <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Reorder Threshold
                          </div>
                        </th>
                        <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Retail Price
                          </div>
                        </th>
                        <th className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
                      {[...Array(6)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-lg py-md whitespace-nowrap">
                            <div className="h-4 bg-surface-container-highest rounded w-32 mb-2"></div>
                            <div className="h-3 bg-surface-container-highest rounded w-20"></div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <div className="h-4 bg-surface-container-highest rounded w-16"></div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <div className="h-4 bg-surface-container-highest rounded w-20"></div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <div className="h-6 bg-surface-container-highest rounded w-12"></div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <div className="h-4 bg-surface-container-highest rounded w-8"></div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <div className="h-4 bg-surface-container-highest rounded w-16"></div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <div className="h-6 bg-surface-container-highest rounded w-20"></div>
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
            <div className="bg-error-container text-on-error-container px-lg py-md rounded-lg border border-error font-body-md mb-lg">
              {error}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-xl">
              <div className="text-on-surface-variant font-body-md">
                {searchQuery ? `No products found for "${searchQuery}"` : 'No products found'}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-md text-primary hover:text-primary-container font-body-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="px-lg py-xl">
                <div className="flex items-center justify-between mb-lg">
                  <h3 className="font-h2 text-h2 text-on-background">
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
                        className="block w-48 pl-10 pr-8 py-2 border border-outline-variant rounded-md leading-5 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-sm"
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
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">swap_vert</span>
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
                        className="block w-64 pl-10 pr-3 py-2 border border-outline-variant rounded-md leading-5 bg-surface-container-lowest placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-sm"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-outline-variant">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                            Product
                          </div>
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">tag</span>
                            SKU
                          </div>
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">inventory</span>
                            Current Stock
                          </div>
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Reorder Threshold
                          </div>
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Retail Price
                          </div>
                        </th>
                        <th scope="col" className="px-lg py-md text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-surface-container-low">
                          <td className="px-lg py-md whitespace-nowrap">
                            <div>
                              <div className="font-body-md text-body-md text-on-background">
                                {product.name}
                              </div>
                              {product.size && product.variant && (
                                <div className="font-body-sm text-body-sm text-on-surface-variant">
                                  {product.size} - {product.variant}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap font-body-md text-body-md text-on-background">
                            {product.sku}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap font-body-md text-body-md text-on-background">
                            {product.category}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-md py-sm font-body-sm font-semibold rounded-full ${
                              product.currentStock <= product.reorderThreshold 
                                ? 'bg-error-container text-on-error-container' 
                                : 'bg-primary-fixed text-on-primary-fixed'
                            }`}>
                              <span className="material-symbols-outlined text-sm">inventory</span>
                              {product.currentStock}
                            </span>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap font-body-md text-body-md text-on-background">
                            {product.reorderThreshold}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap font-body-md text-body-md text-on-background">
                            ₱{Number(product.retailPrice).toFixed(2)}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-md py-sm font-label-md font-label-md rounded-full ${
                              product.currentStock === 0
                                ? 'bg-error-container text-on-error-container'
                                : product.isLowStock
                                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                                : 'bg-primary-fixed text-on-primary-fixed'
                            }`}>
                              {product.currentStock === 0 ? (
                                <>
                                  <span className="material-symbols-outlined text-sm">cancel</span>
                                  Out of Stock
                                </>
                              ) : product.isLowStock ? (
                                <>
                                  <span className="material-symbols-outlined text-sm">warning</span>
                                  Low Stock
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
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
