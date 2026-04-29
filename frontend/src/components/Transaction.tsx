import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Scissors, 
  ChevronLeft,
  Search,
  Plus,
  Minus,
  Camera,
  CheckCircle
} from 'lucide-react';
import { productsApi, Product } from '../api/products';
import { transactionsApi } from '../api/transactions';
import destinationApi, { DeliveryDestination } from '../api/destinationApi';

// Transaction types with icons and descriptions
const TRANSACTION_TYPES = [
  {
    type: 'INBOUND',
    label: 'Supplier Inbound',
    icon: Package,
    description: 'Stock coming from suppliers',
    color: 'bg-green-500'
  },
  {
    type: 'OUTBOUND',
    label: 'Client Delivery',
    icon: Truck,
    description: 'Orders to delivery destinations',
    color: 'bg-blue-500'
  },
  {
    type: 'USAGE',
    label: 'Salon Use',
    icon: Scissors,
    description: 'Products used in salon services',
    color: 'bg-purple-500'
  }
];

interface TransactionItem {
  productId: string;
  product: Product;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
}

interface TransactionData {
  type: string;
  destinationId?: string;
  sourceId?: string;
  supplierId?: string;
  adjustmentReason?: string;
  remarks?: string;
  items: TransactionItem[];
}

const Transaction: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionData, setTransactionData] = useState<TransactionData>({
    type: '',
    items: []
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [destinations, setDestinations] = useState<DeliveryDestination[]>([]);
  // TODO: suppliers should be stored in the database.
  const [suppliers] = useState([
    { id: '1', name: 'Beauty Supply Co', contact: '+1-555-0101' },
    { id: '2', name: 'Hair Care Distributors', contact: '+1-555-0102' },
    { id: '3', name: 'Salon Products Inc', contact: '+1-555-0103' }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchDestinations();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getProducts({ isActive: true });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchDestinations = async () => {
    try {
      const destinations = await destinationApi.getAllDestinations();
      setDestinations(destinations);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
    }
  };

  const handleTypeSelect = (type: string) => {
    setTransactionData(prev => ({ ...prev, type }));
    setCurrentStep(2);
  };

  const handleDestinationSelect = (destinationId: string) => {
    setTransactionData(prev => ({ ...prev, destinationId }));
    setCurrentStep(3);
  };

  const handleProductAdd = (product: Product) => {
    const existingItem = transactionData.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      updateItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: TransactionItem = {
        productId: product.id,
        product,
        quantity: 1,
        unitCost: Number(product.wholesaleCost), // Estimate cost
        totalCost: Number(product.wholesaleCost)
      };
      setTransactionData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setTransactionData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.productId !== productId)
      }));
    } else {
      setTransactionData(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.productId === productId 
            ? { 
                ...item, 
                quantity, 
                totalCost: (item.unitCost || 0) * quantity 
              }
            : item
        )
      }));
    }
  };

  const calculateTotal = () => {
    return transactionData.items.reduce((total, item) => total + (item.totalCost || 0), 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create transaction for each item
      const promises = transactionData.items.map(item =>
        transactionsApi.createTransaction({
          productId: item.productId,
          type: transactionData.type as any,
          quantity: transactionData.type === 'INBOUND' ? item.quantity : -item.quantity,
          remarks: transactionData.remarks || `${transactionData.type} transaction`,
          destinationId: transactionData.type === 'OUTBOUND' ? transactionData.destinationId : undefined
        })
      );

      const results = await Promise.all(promises);
      
      // Check if any orders were created for OUTBOUND transactions
      const ordersCreated = results.filter(result => result.data?.order).length;
      
      // Reset and go back to step 1
      setTransactionData({ type: '', items: [] });
      setCurrentStep(1);
      
      let message = 'Transaction completed successfully!';
      if (transactionData.type === 'OUTBOUND' && ordersCreated > 0) {
        message += ` ${ordersCreated} order(s) created and added to Active Orders.`;
      }
      
      alert(message);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Transaction Type</h2>
        <p className="text-gray-600">Select the type of transaction you want to create</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRANSACTION_TYPES.map(({ type, label, icon: Icon, description, color }) => (
          <button
            key={type}
            onClick={() => handleTypeSelect(type)}
            className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
              transactionData.type === type
                ? 'border-[#3D727A] bg-[#3D727A]/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => {
    const selectedType = TRANSACTION_TYPES.find(t => t.type === transactionData.type);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Destination</h2>
            <p className="text-gray-600">
              {selectedType?.label} - {selectedType?.description}
            </p>
          </div>
        </div>

        {transactionData.type === 'OUTBOUND' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Delivery Destinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {destinations.map(destination => (
                <button
                  key={destination.id}
                  onClick={() => handleDestinationSelect(destination.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    transactionData.destinationId === destination.id
                      ? 'border-[#3D727A] bg-[#3D727A]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{destination.name}</div>
                  <div className="text-sm text-gray-600">{destination.fullAddress}</div>
                  {destination.contactPerson && (
                    <div className="text-sm text-gray-500 mt-1">
                      Contact: {destination.contactPerson}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {transactionData.type === 'INBOUND' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Suppliers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map(supplier => (
                <button
                  key={supplier.id}
                  onClick={() => {
                    setTransactionData(prev => ({ ...prev, supplierId: supplier.id }));
                    setCurrentStep(3);
                  }}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    transactionData.supplierId === supplier.id
                      ? 'border-[#3D727A] bg-[#3D727A]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{supplier.name}</div>
                  <div className="text-sm text-gray-600">{supplier.contact}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {transactionData.type === 'USAGE' && (
          <div className="text-center py-8">
            <button
              onClick={() => setCurrentStep(3)}
              className="bg-[#3D727A] text-white px-6 py-3 rounded-lg hover:bg-[#3D727A]/90 transition-colors"
            >
              Continue to Products
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentStep(2)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Products</h2>
          <p className="text-gray-600">Add products and quantities for this transaction</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
        />
        <button
          onClick={() => setScanning(!scanning)}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
            scanning ? 'bg-[#3D727A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Items */}
      {transactionData.items.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Selected Items</h3>
          <div className="space-y-2">
            {transactionData.items.map(item => (
              <div key={item.productId} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.product.name}</div>
                  <div className="text-sm text-gray-600">SKU: {item.product.sku}</div>
                  <div className="text-sm text-gray-500">
                    ${(item.unitCost || 0).toFixed(2)} per unit
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="w-20 text-right font-medium">
                    ${(item.totalCost || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Available Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredProducts.map(product => {
            const isSelected = transactionData.items.some(item => item.productId === product.id);
            return (
              <button
                key={product.id}
                onClick={() => handleProductAdd(product)}
                disabled={isSelected}
                className={`p-4 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600">SKU: {product.sku}</div>
                <div className="text-sm text-gray-500">
                  Stock: {product.currentStock} | ₱{product.wholesaleCost}
                </div>
                {isSelected && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    ✓ Added to transaction
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      {transactionData.items.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-900">
            Total: ${calculateTotal().toFixed(2)}
          </div>
          <button
            onClick={() => setCurrentStep(4)}
            className="bg-[#3D727A] text-white px-6 py-3 rounded-lg hover:bg-[#3D727A]/90 transition-colors"
          >
            Review Transaction
          </button>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentStep(3)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
          <p className="text-gray-600">Review your transaction before submitting</p>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600">Type</div>
            <div className="font-medium">
              {TRANSACTION_TYPES.find(t => t.type === transactionData.type)?.label}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Items</div>
            <div className="font-medium">{transactionData.items.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Value</div>
            <div className="font-medium text-lg text-[#3D727A]">
              ${calculateTotal().toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Stock Impact</div>
            <div className="font-medium">
              {transactionData.type === 'INBOUND' ? '+' : '-'}
              {transactionData.items.reduce((sum, item) => sum + item.quantity, 0)} units
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Quantity</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Unit Cost</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {transactionData.items.map(item => (
                <tr key={item.productId} className="border-t">
                  <td className="px-4 py-2">
                    <div>
                      <div className="font-medium text-gray-900">{item.product.name}</div>
                      <div className="text-xs text-gray-500">{item.product.sku}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    ${(item.unitCost || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    ${(item.totalCost || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right font-semibold">
                  Total:
                </td>
                <td className="px-4 py-2 text-right font-semibold text-lg text-[#3D727A]">
                  ${calculateTotal().toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Remarks */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks (Optional)
          </label>
          <textarea
            value={transactionData.remarks || ''}
            onChange={(e) => setTransactionData(prev => ({ ...prev, remarks: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
            rows={3}
            placeholder="Add any notes about this transaction..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || transactionData.items.length === 0}
            className="flex-1 bg-[#3D727A] text-white py-3 px-4 rounded-lg hover:bg-[#3D727A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Transaction'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                step <= currentStep
                  ? 'bg-[#3D727A] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 4 && (
              <div
                className={`w-16 h-1 mx-2 transition-colors ${
                  step < currentStep ? 'bg-[#3D727A]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default Transaction;
