import React, { useState, useEffect } from 'react';
import { lorawanAPI } from '../../services/lorawanAPI';
import { organizationAPI } from '../../services/organizationAPI';
import { siteAPI } from '../../services/siteAPI';
import GatewayModal from '../../components/LoRaWAN/GatewayModal';
import GatewayDetailsModal from '../../components/LoRaWAN/GatewayDetailsModal';
import GatewayStatsModal from '../../components/LoRaWAN/GatewayStatsModal';
import Pagination from '../../components/Pagination';

const LoRaWANGateways = () => {
  const [gateways, setGateways] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterSite, setFilterSite] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
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
      fetchSites();
    } else {
      setSites([]);
      setFilterSite('all');
    }
  }, [filterOrganization]);

  useEffect(() => {
    fetchGateways();
  }, [pagination.page, filterOrganization, filterSite, filterStatus]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await siteAPI.getAllSites({ 
        organization_id: filterOrganization,
        pageSize: 100 
      });
      setSites(response.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
    }
  };

  const fetchGateways = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      if (filterOrganization !== 'all') {
        params.organization_id = parseInt(filterOrganization, 10);
      }
      if (filterSite !== 'all') {
        params.site_id = parseInt(filterSite, 10);
      }
      if (filterStatus !== 'all') {
        params.is_active = filterStatus === 'true';
      }

      const response = await lorawanAPI.getAllGateways(params);
      
      const gatewaysData = response.data || response || [];
      setGateways(Array.isArray(gatewaysData) ? gatewaysData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Fetch gateways error:', err);
      setError(err.message || 'Failed to fetch gateways');
      setGateways([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (gateway) => {
    try {
      const response = await lorawanAPI.getGatewayById(gateway.gateway_id);
      setSelectedGateway(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching gateway details:', err);
      alert(`❌ ${err.message || 'Failed to fetch gateway details'}`);
    }
  };

  const handleViewStats = (gateway) => {
    setSelectedGateway(gateway);
    setIsStatsModalOpen(true);
  };

  const handleEditGateway = (gateway) => {
    setSelectedGateway(gateway);
    setIsGatewayModalOpen(true);
  };

  const handleDeleteGateway = async (gatewayId, gatewayName) => {
    if (window.confirm(`Delete gateway "${gatewayName}"? This action cannot be undone.`)) {
      try {
        await lorawanAPI.deleteGateway(gatewayId);
        alert('✅ Gateway deleted successfully');
        fetchGateways();
      } catch (err) {
        console.error('Delete error:', err);
        alert(`❌ ${err.message || 'Failed to delete gateway'}`);
      }
    }
  };

  const getStatusColor = (minutesSinceSeen) => {
    if (minutesSinceSeen === null || minutesSinceSeen === undefined) {
      return 'bg-gray-400 text-white';
    }
    if (minutesSinceSeen < 5) return 'bg-green-500 text-white';
    if (minutesSinceSeen < 15) return 'bg-yellow-500 text-white';
    if (minutesSinceSeen < 60) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getStatusText = (minutesSinceSeen) => {
    if (minutesSinceSeen === null || minutesSinceSeen === undefined) {
      return 'Never Seen';
    }
    if (minutesSinceSeen < 5) return 'Online';
    if (minutesSinceSeen < 15) return 'Recently Active';
    if (minutesSinceSeen < 60) return 'Inactive';
    return 'Offline';
  };

  const formatLastSeen = (dateString, minutesSinceSeen) => {
    if (!dateString) return 'Never';
    if (minutesSinceSeen < 1) return 'Just now';
    if (minutesSinceSeen < 60) return `${Math.floor(minutesSinceSeen)}m ago`;
    
    const hours = Math.floor(minutesSinceSeen / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredGateways = gateways.filter(gateway => {
    if (!searchTerm) return true;
    const name = (gateway.gateway_name || '').toLowerCase();
    const eui = (gateway.gateway_eui || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || eui.includes(searchTerm.toLowerCase());
  });

  const onlineGateways = gateways.filter(g => g.minutes_since_seen !== null && g.minutes_since_seen < 5);
  const offlineGateways = gateways.filter(g => g.minutes_since_seen === null || g.minutes_since_seen >= 60);

  if (loading && gateways.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading gateways...</p>
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
              <h1 className="text-2xl font-bold text-secondary-700">LoRaWAN Gateways</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor and manage your LoRaWAN gateway network</p>
            </div>
            <button
              onClick={() => {
                setSelectedGateway(null);
                setIsGatewayModalOpen(true);
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Gateway
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gateways</p>
                <p className="text-2xl font-bold text-gray-900">{gateways.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Online</p>
                <p className="text-2xl font-bold text-green-600">{onlineGateways.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-red-600">{offlineGateways.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-purple-600">
                  {gateways.filter(g => g.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[250px] relative">
              <input
                type="text"
                placeholder="Search gateways by name or EUI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

            {filterOrganization !== 'all' && (
              <select
                value={filterSite}
                onChange={(e) => {
                  setFilterSite(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
              >
                <option value="all">All Sites</option>
                {sites.map(site => (
                  <option key={site.site_id} value={site.site_id}>
                    {site.site_name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <button
              onClick={fetchGateways}
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

        {/* Gateways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGateways.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No gateways found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Click "Add Gateway" to register your first gateway'}
              </p>
            </div>
          ) : (
            filteredGateways.map((gateway) => (
              <div
                key={gateway.gateway_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
              >
                {/* Gateway Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(gateway.minutes_since_seen)} animate-pulse`}></div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(gateway.minutes_since_seen)}`}>
                          {getStatusText(gateway.minutes_since_seen)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {gateway.gateway_name || 'Unnamed Gateway'}
                      </h3>
                      <p className="text-xs text-gray-600 font-mono mt-1">{gateway.gateway_eui || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Gateway Card Body */}
                <div className="p-4 space-y-3">
                  {/* Organization & Site */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-600 truncate">{gateway.organization_name || 'N/A'}</span>
                    </div>
                    {gateway.site_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600 truncate">{gateway.site_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Gateway Model */}
                  {gateway.gateway_model && (
                    <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-700">Model:</span>
                        <span className="font-semibold text-purple-900">{gateway.gateway_model}</span>
                      </div>
                    </div>
                  )}

                  {/* Location Info */}
                  {(gateway.latitude || gateway.longitude) && (
                    <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                      <div className="text-xs text-green-900">
                        <div className="flex justify-between">
                          <span className="text-green-700">Latitude:</span>
                          <span className="font-semibold">{gateway.latitude?.toFixed(6) || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-green-700">Longitude:</span>
                          <span className="font-semibold">{gateway.longitude?.toFixed(6) || 'N/A'}</span>
                        </div>
                        {gateway.altitude !== null && gateway.altitude !== undefined && (
                          <div className="flex justify-between mt-1">
                            <span className="text-green-700">Altitude:</span>
                            <span className="font-semibold">{gateway.altitude}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Seen */}
                  <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded p-2">
                    <span>Last Seen:</span>
                    <span className="font-semibold">{formatLastSeen(gateway.last_seen_at, gateway.minutes_since_seen)}</span>
                  </div>
                </div>

                {/* Gateway Card Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(gateway)}
                      className="px-3 py-1.5 text-primary-600 hover:bg-primary-50 rounded transition text-sm font-medium"
                      title="View Details"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleViewStats(gateway)}
                      className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded transition text-sm font-medium"
                      title="View Statistics"
                    >
                      Stats
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditGateway(gateway)}
                      className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteGateway(gateway.gateway_id, gateway.gateway_name)}
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
      {isGatewayModalOpen && (
        <GatewayModal
          gateway={selectedGateway}
          organizations={organizations}
          onClose={() => {
            setIsGatewayModalOpen(false);
            setSelectedGateway(null);
          }}
          onSuccess={() => {
            setIsGatewayModalOpen(false);
            setSelectedGateway(null);
            fetchGateways();
          }}
        />
      )}

      {isDetailsModalOpen && selectedGateway && (
        <GatewayDetailsModal
          gateway={selectedGateway}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedGateway(null);
          }}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsGatewayModalOpen(true);
          }}
          onRefresh={fetchGateways}
        />
      )}

      {isStatsModalOpen && selectedGateway && (
        <GatewayStatsModal
          gateway={selectedGateway}
          onClose={() => {
            setIsStatsModalOpen(false);
            setSelectedGateway(null);
          }}
        />
      )}
    </div>
  );
};

export default LoRaWANGateways;
