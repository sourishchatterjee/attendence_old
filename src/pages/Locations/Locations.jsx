import React, { useState, useEffect } from 'react';
import { locationAPI } from '../../services/locationAPI';
import { organizationAPI } from '../../services/organizationAPI';
import { siteAPI } from '../../services/siteAPI';
import ZoneModal from '../../components/Locations/ZoneModal';
import LocationModal from '../../components/Locations/LocationModal';
import ZoneDetailsModal from '../../components/Locations/ZoneDetailsModal';
import Pagination from '../../components/Pagination';

const Locations = () => {
  const [activeTab, setActiveTab] = useState('zones'); // 'zones' or 'locations'
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterSite, setFilterSite] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [filterZoneType, setFilterZoneType] = useState('all');
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isZoneDetailsOpen, setIsZoneDetailsOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (filterOrganization !== 'all') {
      fetchSitesByOrganization(filterOrganization);
    } else {
      setSites([]);
      setFilterSite('all');
    }
  }, [filterOrganization]);

  useEffect(() => {
    if (activeTab === 'zones') {
      fetchZones();
    } else {
      fetchLocations();
    }
  }, [activeTab, pagination.page, filterActive, filterOrganization, filterSite, filterZone, filterZoneType]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchSitesByOrganization = async (orgId) => {
    try {
      const response = await siteAPI.getAllSites({ 
        organization_id: parseInt(orgId, 10),
        pageSize: 100 
      });
      setSites(response.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
      setSites([]);
    }
  };

  const fetchZones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      if (filterActive !== 'all') {
        params.is_active = filterActive === 'active';
      }

      if (filterOrganization !== 'all') {
        params.organization_id = parseInt(filterOrganization, 10);
      }

      if (filterSite !== 'all') {
        params.site_id = parseInt(filterSite, 10);
      }

      if (filterZoneType !== 'all') {
        params.zone_type = filterZoneType;
      }

      const response = await locationAPI.getAllZones(params);
      
      const zonesData = response.data || response || [];
      setZones(Array.isArray(zonesData) ? zonesData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch zones error:', err);
      setError(err.message || 'Failed to fetch zones');
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      if (filterActive !== 'all') {
        params.is_active = filterActive === 'active';
      }

      if (filterZone !== 'all') {
        params.zone_id = parseInt(filterZone, 10);
      }

      const response = await locationAPI.getAllLocations(params);
      
      const locationsData = response.data || response || [];
      setLocations(Array.isArray(locationsData) ? locationsData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }

      // Fetch zones for filter dropdown
      if (zones.length === 0) {
        const zonesResponse = await locationAPI.getAllZones({ pageSize: 100 });
        setZones(zonesResponse.data || []);
      }
    } catch (err) {
      console.error('Fetch locations error:', err);
      setError(err.message || 'Failed to fetch locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateZone = () => {
    setSelectedZone(null);
    setIsZoneModalOpen(true);
  };

  const handleCreateLocation = () => {
    setSelectedLocation(null);
    setIsLocationModalOpen(true);
  };

  const handleEditZone = (zone) => {
    setSelectedZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleViewZone = (zone) => {
    setSelectedZone(zone);
    setIsZoneDetailsOpen(true);
  };

  const handleDeleteZone = async (zoneId, zoneName) => {
    if (window.confirm(`Are you sure you want to delete zone "${zoneName}"?`)) {
      try {
        await locationAPI.deleteZone(zoneId);
        showNotification('Zone deleted successfully', 'success');
        fetchZones();
      } catch (err) {
        console.error('Delete zone error:', err);
        showNotification(err.message || 'Failed to delete zone', 'error');
      }
    }
  };

  const handleDeleteLocation = async (locationId, locationName) => {
    if (window.confirm(`Are you sure you want to delete location "${locationName}"?`)) {
      try {
        await locationAPI.deleteLocation(locationId);
        showNotification('Location deleted successfully', 'success');
        fetchLocations();
      } catch (err) {
        console.error('Delete location error:', err);
        showNotification(err.message || 'Failed to delete location', 'error');
      }
    }
  };

  const showNotification = (message, type) => {
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  const getZoneTypeBadge = (type) => {
    const types = {
      'Single': 'bg-blue-100 text-blue-700',
      'Multiple': 'bg-purple-100 text-purple-700',
    };
    return types[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredZones = zones.filter(zone =>
    zone.zone_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.site_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLocations = locations.filter(location =>
    location.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.zone_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && (zones.length === 0 && locations.length === 0)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-secondary-700">Location Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage location zones and GPS coordinates</p>
            </div>
            <button
              onClick={activeTab === 'zones' ? handleCreateZone : handleCreateLocation}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeTab === 'zones' ? 'Add Zone' : 'Add Location'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('zones');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'zones'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Location Zones
                {zones.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    {zones.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('locations');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'locations'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Locations
                {locations.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    {locations.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Zone-specific filters */}
            {activeTab === 'zones' && (
              <>
                <select
                  value={filterOrganization}
                  onChange={(e) => {
                    setFilterOrganization(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Organizations</option>
                  {organizations.map(org => (
                    <option key={org.organization_id} value={org.organization_id}>
                      {org.organization_name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterSite}
                  onChange={(e) => {
                    setFilterSite(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  disabled={filterOrganization === 'all'}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm disabled:opacity-50"
                >
                  <option value="all">All Sites</option>
                  {sites.map(site => (
                    <option key={site.site_id} value={site.site_id}>
                      {site.site_name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterZoneType}
                  onChange={(e) => {
                    setFilterZoneType(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="Single">Single</option>
                  <option value="Multiple">Multiple</option>
                </select>
              </>
            )}

            {/* Location-specific filters */}
            {activeTab === 'locations' && (
              <select
                value={filterZone}
                onChange={(e) => {
                  setFilterZone(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
              >
                <option value="all">All Zones</option>
                {zones.map(zone => (
                  <option key={zone.zone_id} value={zone.zone_id}>
                    {zone.zone_name}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Refresh */}
            <button
              onClick={activeTab === 'zones' ? fetchZones : fetchLocations}
              disabled={loading}
              className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {activeTab === 'zones' ? (
          /* Zones Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No zones found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search' : 'Click "Add Zone" to create your first zone'}
                </p>
              </div>
            ) : (
              filteredZones.map((zone) => (
                <div
                  key={zone.zone_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
                >
                  {/* Zone Card Header */}
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {zone.zone_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getZoneTypeBadge(zone.zone_type)}`}>
                            {zone.zone_type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              zone.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {zone.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zone Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Organization */}
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-600">{zone.organization_name || 'N/A'}</span>
                    </div>

                    {/* Site */}
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-gray-600">{zone.site_name || 'N/A'}</span>
                    </div>

                    {/* Location Count */}
                    <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-blue-900 font-semibold">
                        {zone.location_count || 0} Location{zone.location_count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Description */}
                    {zone.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {zone.description}
                      </p>
                    )}
                  </div>

                  {/* Zone Card Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => handleViewZone(zone)}
                      className="text-sm text-accent-blue hover:text-accent-teal transition font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditZone(zone)}
                        className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteZone(zone.zone_id, zone.zone_name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Locations Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No locations found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search' : 'Click "Add Location" to create your first location'}
                </p>
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div
                  key={location.location_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
                >
                  {/* Location Card Header */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {location.location_name}
                        </h3>
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
                    </div>
                  </div>

                  {/* Location Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Zone */}
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-gray-600">{location.zone_name || 'N/A'}</span>
                    </div>

                    {/* Coordinates */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-blue-600 font-medium">Latitude</p>
                          <p className="text-blue-900 font-bold">{location.latitude}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-medium">Longitude</p>
                          <p className="text-blue-900 font-bold">{location.longitude}</p>
                        </div>
                      </div>
                    </div>

                    {/* Radius */}
                    <div className="flex items-center gap-2 text-sm bg-purple-50 rounded-lg p-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="text-purple-900 font-semibold">
                        Radius: {location.radius_meters}m
                      </span>
                    </div>

                    {/* Address */}
                    {location.address && (
                      <div className="text-xs text-gray-600 line-clamp-2">
                        <svg className="w-3 h-3 inline-block mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {location.address}
                      </div>
                    )}
                  </div>

                  {/* Location Card Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <a
                      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-700 transition font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Map
                    </a>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditLocation(location)}
                        className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.location_id, location.location_name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isZoneModalOpen && (
        <ZoneModal
          zone={selectedZone}
          organizations={organizations}
          sites={sites}
          onClose={() => {
            setIsZoneModalOpen(false);
            setSelectedZone(null);
          }}
          onSuccess={() => {
            setIsZoneModalOpen(false);
            setSelectedZone(null);
            fetchZones();
          }}
        />
      )}

      {isLocationModalOpen && (
        <LocationModal
          location={selectedLocation}
          zones={zones}
          onClose={() => {
            setIsLocationModalOpen(false);
            setSelectedLocation(null);
          }}
          onSuccess={() => {
            setIsLocationModalOpen(false);
            setSelectedLocation(null);
            fetchLocations();
          }}
        />
      )}

      {isZoneDetailsOpen && selectedZone && (
        <ZoneDetailsModal
          zone={selectedZone}
          onClose={() => {
            setIsZoneDetailsOpen(false);
            setSelectedZone(null);
          }}
          onEdit={() => {
            setIsZoneDetailsOpen(false);
            handleEditZone(selectedZone);
          }}
          onDelete={() => {
            setIsZoneDetailsOpen(false);
            handleDeleteZone(selectedZone.zone_id, selectedZone.zone_name);
          }}
          onRefresh={fetchZones}
        />
      )}
    </div>
  );
};

export default Locations;
