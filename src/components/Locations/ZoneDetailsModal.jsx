import React, { useState, useEffect } from 'react';
import { locationAPI } from '../../services/locationAPI';
import LocationModal from './LocationModal';

const ZoneDetailsModal = ({ zone, onClose, onEdit, onDelete, onRefresh }) => {
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [allZones, setAllZones] = useState([]);

  useEffect(() => {
    if (zone?.zone_id) {
      fetchLocations();
      fetchAllZones();
    }
  }, [zone]);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await locationAPI.getAllLocations({ 
        zone_id: zone.zone_id,
        pageSize: 100 
      });
      setLocations(response.data || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchAllZones = async () => {
    try {
      const response = await locationAPI.getAllZones({ pageSize: 100 });
      setAllZones(response.data || []);
    } catch (err) {
      console.error('Error fetching zones:', err);
    }
  };

  const handleDeleteLocation = async (locationId, locationName) => {
    if (window.confirm(`Remove location "${locationName}" from this zone?`)) {
      try {
        await locationAPI.deleteLocation(locationId);
        alert('✅ Location removed successfully');
        fetchLocations();
        onRefresh();
      } catch (err) {
        console.error('Error removing location:', err);
        alert(`❌ ${err.message || 'Failed to remove location'}`);
      }
    }
  };

  const getZoneTypeBadge = (type) => {
    const types = {
      'Single': 'bg-blue-100 text-blue-700',
      'Multiple': 'bg-purple-100 text-purple-700',
    };
    return types[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-secondary-700">{zone.zone_name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getZoneTypeBadge(zone.zone_type)}`}>
                    {zone.zone_type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{zone.organization_name} • {zone.site_name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="px-3 py-1.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Zone Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-xs font-semibold text-blue-900">Zone Type</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{zone.zone_type}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-semibold text-green-900">Locations</span>
              </div>
              <p className="text-lg font-bold text-green-900">{locations.length}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-purple-900">Status</span>
              </div>
              <p className={`text-lg font-bold ${zone.is_active ? 'text-green-900' : 'text-red-900'}`}>
                {zone.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Description */}
          {zone.description && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Description</h4>
              <p className="text-sm text-blue-800">{zone.description}</p>
            </div>
          )}

          {/* Locations Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Zone Locations</h4>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Location
              </button>
            </div>

            {loadingLocations ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Loading locations...</p>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 text-sm">No locations in this zone</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {locations.map((location) => (
                  <div
                    key={location.location_id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-semibold text-gray-900 truncate">
                          {location.location_name}
                        </h5>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            location.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {location.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteLocation(location.location_id, location.location_name)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 mb-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Latitude</p>
                          <p className="text-gray-900 font-semibold">{location.latitude}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Longitude</p>
                          <p className="text-gray-900 font-semibold">{location.longitude}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        Radius: <span className="font-semibold text-gray-900">{location.radius_meters}m</span>
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Map
                      </a>
                    </div>

                    {location.address && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {location.address}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <LocationModal
          location={null}
          zones={[zone, ...allZones.filter(z => z.zone_id !== zone.zone_id)]}
          onClose={() => setIsLocationModalOpen(false)}
          onSuccess={() => {
            setIsLocationModalOpen(false);
            fetchLocations();
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default ZoneDetailsModal;
