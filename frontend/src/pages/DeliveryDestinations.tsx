import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, MapPin, Phone, Building } from 'lucide-react';
import destinationApi, { DeliveryDestination } from '../api/destinationApi';
import SideNavigation from '../components/SideNavigation';

const DeliveryDestinations: React.FC = () => {
  const [destinations, setDestinations] = useState<DeliveryDestination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<DeliveryDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState<'ALL' | 'PERMANENT' | 'TEMPORARY'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<DeliveryDestination | null>(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [destinations, searchTerm, locationTypeFilter, statusFilter]);

  const fetchDestinations = async () => {
    try {
      const data = await destinationApi.getAllDestinations();
      setDestinations(data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDestinations = () => {
    let filtered = destinations;

    if (searchTerm) {
      filtered = filtered.filter(dest =>
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.fullAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dest.contactPerson && dest.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dest.contactNumber && dest.contactNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (locationTypeFilter !== 'ALL') {
      filtered = filtered.filter(dest => dest.locationType === locationTypeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(dest => dest.status === statusFilter);
    }

    setFilteredDestinations(filtered);
  };

  const handleSaveDestination = async (destination: DeliveryDestination | null, destinationData: any) => {
    try {
      console.log('Saving destination:', destinationData);
      if (destination) {
        console.log('Updating destination with ID:', destination.id);
        await destinationApi.updateDestination(destination.id, destinationData);
        setEditingDestination(null);
      } else {
        console.log('Creating new destination');
        await destinationApi.createDestination(destinationData);
        setShowAddModal(false);
      }
      fetchDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      alert('Error saving destination: ' + (error as Error).message);
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        await destinationApi.deleteDestination(id);
        fetchDestinations();
      } catch (error) {
        console.error('Error deleting destination:', error);
      }
    }
  };

  const getLocationTypeColor = (type: string) => {
    return type === 'PERMANENT' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <SideNavigation configType="with-recent">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading destinations...</div>
        </div>
      </SideNavigation>
    );
  }

  return (
    <SideNavigation configType="with-recent">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Destinations</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#3D727A] text-white px-4 py-2 rounded-lg hover:bg-[#3D727A]/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Destination
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
              />
            </div>
            
            <select
              value={locationTypeFilter}
              onChange={(e) => setLocationTypeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
            >
              <option value="ALL">All Location Types</option>
              <option value="PERMANENT">Permanent</option>
              <option value="TEMPORARY">Temporary</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <div className="text-sm text-gray-500 flex items-center">
              {filteredDestinations.length} of {destinations.length} destinations
            </div>
          </div>
        </div>

        {/* Destinations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDestinations.map((destination) => (
                  <tr key={destination.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{destination.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{destination.fullAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {destination.contactPerson || destination.contactNumber ? (
                        <div className="space-y-1">
                          {destination.contactPerson && (
                            <div className="flex items-center">
                              <Building className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-600 text-sm">{destination.contactPerson}</span>
                            </div>
                          )}
                          {destination.contactNumber && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-600 text-sm">{destination.contactNumber}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLocationTypeColor(destination.locationType)}`}>
                        {destination.locationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(destination.status)}`}>
                        {destination.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingDestination(destination)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(destination.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || locationTypeFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No destinations match your filters.'
                  : 'No destinations found. Add your first destination to get started.'}
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || editingDestination) && (
          <DestinationModal
            destination={editingDestination}
            onSave={handleSaveDestination}
            onClose={() => {
              setShowAddModal(false);
              setEditingDestination(null);
            }}
          />
        )}
      </div>
    </SideNavigation>
  );
};

// Destination Modal Component
interface DestinationModalProps {
  destination: DeliveryDestination | null;
  onSave: (destination: DeliveryDestination | null, data: any) => void;
  onClose: () => void;
}

const DestinationModal: React.FC<DestinationModalProps> = ({ destination, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: destination?.name || '',
    fullAddress: destination?.fullAddress || '',
    contactPerson: destination?.contactPerson || '',
    contactNumber: destination?.contactNumber || '',
    locationType: destination?.locationType || 'PERMANENT',
    status: destination?.status || 'ACTIVE'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave(destination, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {destination ? 'Edit Destination' : 'Add New Destination'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address
              </label>
              <textarea
                required
                rows={3}
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person (Optional)
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number (Optional)
              </label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Type
                </label>
                <select
                  value={formData.locationType}
                  onChange={(e) => setFormData({ ...formData, locationType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
                >
                  <option value="PERMANENT">Permanent</option>
                  <option value="TEMPORARY">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D727A] focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#3D727A] text-white py-2 px-4 rounded-lg hover:bg-[#3D727A]/90 transition-colors"
              >
                {destination ? 'Update' : 'Create'} Destination
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDestinations;
