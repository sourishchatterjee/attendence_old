import React, { useState, useEffect } from 'react';
import { siteAPI } from '../../services/siteAPI';
import { organizationAPI } from '../../services/organizationAPI';
import SiteModal from '../../components/Site/SiteModal';
import SiteDetailsModal from '../../components/Site/SiteDetailsModal';
import Pagination from '../../components/Pagination';
import { decodeJWT } from "../../utils/jwtHelper";


const Sites = () => {


const getOrganizationIdFromToken = () => {
  const token = localStorage.getItem("token");
  const payload = decodeJWT(token);
 // return payload?.organization_id;
 return payload?.organizationId;

};

//console.log(getOrganizationIdFromToken)

  const [sites, setSites] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    fetchSites();
  }, [pagination.page, filterActive, filterOrganization]);



const fetchOrganizations = async () => {
  try {
    const orgId = Number(getOrganizationIdFromToken());

    if (!orgId || isNaN(orgId)) {
      console.error("Invalid organization ID:", orgId);
      return;
    }

    const response = await organizationAPI.getOrganizationById(orgId);

    setOrganizations(response.data ? [response.data] : []);

  } catch (err) {
    console.error('Error fetching organizations:', err);
  }
};


  // const fetchSites = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
      
  //     const params = {
  //       page: pagination.page,
  //       pageSize: pagination.pageSize,
  //     };
      
  //     // Only add is_active if not 'all'
  //     if (filterActive !== 'all') {
  //       params.is_active = filterActive === 'active';
  //     }

  //     // Only add organization_id if not 'all' and ensure it's a valid number
  //     if (filterOrganization !== 'all') {
  //       const orgId = parseInt(filterOrganization, 10);
  //       if (!isNaN(orgId)) {
  //         params.organization_id = orgId;
  //       }
  //     }

  //     const response = await siteAPI.getAllSites(params);
      
  //     // Handle response data structure
  //     const sitesData = response.data || response || [];
  //     setSites(Array.isArray(sitesData) ? sitesData : []);
      
  //     // Handle pagination
  //     if (response.pagination) {
  //       setPagination(prev => ({
  //         ...prev,
  //         ...response.pagination,
  //       }));
  //     } else {
  //       // Fallback if pagination is not in response
  //       setPagination(prev => ({
  //         ...prev,
  //         totalItems: Array.isArray(sitesData) ? sitesData.length : 0,
  //         totalPages: 1,
  //       }));
  //     }
  //   } catch (err) {
  //     console.error('Fetch sites error:', err);
      
  //     // Handle different error structures
  //     if (err.errors && Array.isArray(err.errors)) {
  //       const errorMessages = err.errors.map(e => `${e.field}: ${e.message}`).join(', ');
  //       setError(`Validation Error: ${errorMessages}`);
  //     } else {
  //       setError(err.message || 'Failed to fetch sites');
  //     }
      
  //     // Set empty state on error
  //     setSites([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const fetchSites = async () => {
  try {
    setLoading(true);
    setError(null);

    const orgId = Number(getOrganizationIdFromToken());

    if (!orgId || isNaN(orgId)) {
      setSites([]);
      setError("Invalid organization ID");
      return;
    }

    const response = await organizationAPI.getOrganizationSitesById(orgId);

    const sitesData = response.data || [];
    setSites(Array.isArray(sitesData) ? sitesData : []);

    setPagination(prev => ({
      ...prev,
      totalItems: sitesData.length,
      totalPages: 1
    }));

  } catch (err) {
    console.error("Fetch sites error:", err);
    setError(err.message || "Failed to fetch sites");
    setSites([]);
  } finally {
    setLoading(false);
  }
};

  const handleCreate = () => {
    setSelectedSite(null);
    setIsModalOpen(true);
  };

  const handleEdit = (site) => {
    setSelectedSite(site);
    setIsModalOpen(true);
  };

  const handleView = async (siteId) => {
    try {
      // Validate siteId before making request
      const id = parseInt(siteId, 10);
      if (isNaN(id)) {
        alert('Invalid site ID');
        return;
      }

      const response = await siteAPI.getSiteById(id);
      setSelectedSite(response.data || response);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('View site error:', err);
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map(e => e.message).join(', ');
        alert(`Error: ${errorMessages}`);
      } else {
        alert(err.message || 'Failed to fetch site details');
      }
    }
  };

  const handleDelete = async (siteId, siteName) => {
    if (window.confirm(`Are you sure you want to delete "${siteName}"?`)) {
      try {
        // Validate siteId before making request
        const id = parseInt(siteId, 10);
        if (isNaN(id)) {
          alert('Invalid site ID');
          return;
        }

        await siteAPI.deleteSite(id);
        showNotification('Site deleted successfully', 'success');
        fetchSites();
      } catch (err) {
        console.error('Delete site error:', err);
        if (err.errors && Array.isArray(err.errors)) {
          const errorMessages = err.errors.map(e => e.message).join(', ');
          showNotification(`Error: ${errorMessages}`, 'error');
        } else {
          showNotification(err.message || 'Failed to delete site', 'error');
        }
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSite(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedSite(null);
    fetchSites();
  };

  const showNotification = (message, type) => {
    // You can integrate a proper toast notification library here
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  const filteredSites = sites.filter(site => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      site.site_name?.toLowerCase().includes(search) ||
      site.site_code?.toLowerCase().includes(search) ||
      site.city?.toLowerCase().includes(search) ||
      site.state?.toLowerCase().includes(search) ||
      site.organization_name?.toLowerCase().includes(search)
    );
  });

  if (loading && sites.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading sites...</p>
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
              <h1 className="text-2xl font-bold text-secondary-700">Sites</h1>
              <p className="text-sm text-gray-500 mt-1">Manage sites across your organizations</p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Site
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
                  placeholder="Search sites..."
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
            </div>

            {/* Organization Filter */}
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

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
                {filterActive !== 'all' && (
                  <span className="ml-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    1
                  </span>
                )}
              </button>

              {showFilterPanel && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterPanel(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">Status</h3>
                      {filterActive !== 'all' && (
                        <button
                          onClick={() => {
                            setFilterActive('all');
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="all"
                          checked={filterActive === 'all'}
                          onChange={(e) => {
                            setFilterActive(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">All</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={filterActive === 'active'}
                          onChange={(e) => {
                            setFilterActive(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={filterActive === 'inactive'}
                          onChange={(e) => {
                            setFilterActive(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Inactive</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Export Button */}
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>

            {/* Refresh */}
            <button
              onClick={fetchSites}
              disabled={loading}
              className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-teal transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Error Loading Sites</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading sites...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredSites.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-500 text-sm font-medium">No sites found</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {searchTerm ? 'Try adjusting your search' : 'Click "Add Site" to create your first site'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSites.map((site) => (
                    <tr key={site.site_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-accent-lightBlue flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{site.site_name}</div>
                            <div className="text-xs text-gray-500">Code: {site.site_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{site.organization_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{site.city}, {site.state}</div>
                        <div className="text-xs text-gray-500">{site.country} - {site.pincode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <svg className="w-4 h-4 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {site.employee_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            site.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            site.is_active ? 'bg-green-600' : 'bg-red-600'
                          }`}></span>
                          {site.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(site.site_id)}
                            className="text-accent-blue hover:text-accent-teal transition"
                            title="View"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(site)}
                            className="text-secondary-500 hover:text-secondary-700 transition"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(site.site_id, site.site_name)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
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
      </div>

      {/* Modals */}
      {isModalOpen && (
        <SiteModal
          site={selectedSite}
          organizations={organizations}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {isDetailsModalOpen && (
        <SiteDetailsModal
          site={selectedSite}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedSite(null);
          }}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default Sites;
