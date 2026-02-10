 import React, { useState, useEffect } from 'react';
// import { organizationAPI } from '../../services/organizationAPI';
// import { siteAPI } from '../../services/siteAPI';
// import { locationAPI } from '../../services/locationAPI'; // for zones & locations
// import { groupSettingsAPI } from '../../services/groupSettingsAPI'; // you create this wrapper
// import { employeeGroupAPI } from '../../services/employeeGroupAPI'; // you create this wrapper
// import Pagination from '../../components/Pagination';

function LocationAassingSettings() {
  const [activeTab, setActiveTab] = useState('group-settings'); // 'group-settings' | 'employee-assignments'

  const [organizations, setOrganizations] = useState([]);
  const [sites, setSites] = useState([]);
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);

  // group_settings list
  const [groupSettings, setGroupSettings] = useState([]);
  // employee_group_assignments list
  const [employeeAssignments, setEmployeeAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // filters
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterSite, setFilterSite] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterActive, setFilterActive] = useState('all');

  // selected items for edit
  const [selectedGroupSetting, setSelectedGroupSetting] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
  });

  // INITIAL LOAD
  useEffect(() => {
    fetchOrganizations();
    fetchZonesAndLocations();
  }, []);

  // SITES ON ORG CHANGE
  useEffect(() => {
    if (filterOrganization !== 'all') {
      fetchSitesByOrganization(filterOrganization);
    } else {
      setSites([]);
      setFilterSite('all');
    }
  }, [filterOrganization]);

  // FETCH DATA WHEN TAB / FILTERS / PAGE CHANGE
  useEffect(() => {
    if (activeTab === 'group-settings') {
      fetchGroupSettings();
    } else {
      fetchEmployeeAssignments();
    }
  }, [
    activeTab,
    pagination.page,
    filterOrganization,
    filterSite,
    filterZone,
    filterLocation,
    filterActive,
  ]);

  const fetchOrganizations = async () => {
    try {
      const res = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(res.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchSitesByOrganization = async (orgId) => {
    try {
      const res = await siteAPI.getAllSites({
        organization_id: parseInt(orgId, 10),
        pageSize: 100,
      });
      setSites(res.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
      setSites([]);
    }
  };

  const fetchZonesAndLocations = async () => {
    try {
      const zonesRes = await locationAPI.getAllZones({ pageSize: 100 });
      const zonesData = zonesRes.data || zonesRes || [];
      setZones(Array.isArray(zonesData) ? zonesData : []);

      const locRes = await locationAPI.getAllLocations({ pageSize: 100 });
      const locData = locRes.data || locRes || [];
      setLocations(Array.isArray(locData) ? locData : []);
    } catch (err) {
      console.error('Error fetching zones/locations:', err);
    }
  };

  const buildCommonParams = () => {
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
    if (filterZone !== 'all') {
      params.zone_id = parseInt(filterZone, 10);
    }
    if (filterLocation !== 'all') {
      params.location_id = parseInt(filterLocation, 10);
    }
    if (filterActive !== 'all') {
      params.is_active = filterActive === 'active';
    }
    if (searchTerm) {
      params.search = searchTerm;
    }

    return params;
  };

  // API: group_settings
  const fetchGroupSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // backend getAllGroupSettings currently has no filters/pagination,
      // so you can extend it later; for now, just call it:
      const res = await groupSettingsAPI.getAllGroupSettings();

      const data = res.data || res || [];
      setGroupSettings(Array.isArray(data) ? data : []);

      // If you later add pagination in backend, update here:
      if (res.pagination) {
        setPagination(prev => ({
          ...prev,
          ...res.pagination,
        }));
      } else {
        setPagination(prev => ({
          ...prev,
          totalItems: data.length,
          totalPages: Math.ceil(data.length / prev.pageSize) || 1,
        }));
      }
    } catch (err) {
      console.error('Error fetching group settings:', err);
      setError(err.message || 'Failed to fetch group settings');
      setGroupSettings([]);
    } finally {
      setLoading(false);
    }
  };

  // API: employee_group_assignments
  const fetchEmployeeAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = buildCommonParams();
      // backend getAllEmployeeGroups currently has no filters,
      // you can ignore params or extend backend later
      const res = await employeeGroupAPI.getAllEmployeeGroups(params);

      const data = res.data || res || [];
      setEmployeeAssignments(Array.isArray(data) ? data : []);

      if (res.pagination) {
        setPagination(prev => ({
          ...prev,
          ...res.pagination,
        }));
      } else {
        setPagination(prev => ({
          ...prev,
          totalItems: data.length,
          totalPages: Math.ceil(data.length / prev.pageSize) || 1,
        }));
      }
    } catch (err) {
      console.error('Error fetching employee assignments:', err);
      setError(err.message || 'Failed to fetch employee assignments');
      setEmployeeAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // CREATE / UPDATE group_settings
  const handleCreateGroupSetting = () => {
    setSelectedGroupSetting(null);
    // open your modal/drawer here
    alert('Open create group setting modal');
  };

  const handleEditGroupSetting = (gs) => {
    setSelectedGroupSetting(gs);
    // open modal with gs data
    alert('Open edit group setting modal');
  };

  const handleDeleteGroupSetting = async (group_setting_id) => {
    if (!window.confirm('Are you sure you want to delete this group setting?')) return;

    try {
      await groupSettingsAPI.deleteGroupSetting(group_setting_id);
      showNotification('Group setting deleted successfully', 'success');
      fetchGroupSettings();
    } catch (err) {
      console.error('Delete group setting error:', err);
      showNotification(err.message || 'Failed to delete group setting', 'error');
    }
  };

  // ASSIGN / UNASSIGN EMPLOYEES
  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    alert('Open create employee assignment modal');
  };

  const handleEditAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    alert('Open edit employee assignment modal');
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this employee assignment?')) return;

    try {
      await employeeGroupAPI.deleteEmployeeGroup(assignmentId);
      showNotification('Assignment deleted successfully', 'success');
      fetchEmployeeAssignments();
    } catch (err) {
      console.error('Delete assignment error:', err);
      showNotification(err.message || 'Failed to delete assignment', 'error');
    }
  };

  const showNotification = (message, type) => {
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  // Derived display helpers
  const getOrganizationName = (id) => {
    const org = organizations.find(o => o.organization_id === id);
    return org?.organization_name || 'N/A';
  };

  const getZoneName = (id) => {
    const z = zones.find(z => z.zone_id === id);
    return z?.zone_name || 'N/A';
  };

  const getLocationName = (id) => {
    const l = locations.find(l => l.location_id === id);
    return l?.location_name || 'N/A';
  };

  const filteredGroupSettings = groupSettings.filter(gs => {
    const orgName = getOrganizationName(gs.organization_id).toLowerCase();
    const zoneName = getZoneName(gs.zone_id).toLowerCase();
    const locName = getLocationName(gs.location_id).toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      orgName.includes(term) ||
      zoneName.includes(term) ||
      locName.includes(term);

    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && gs.is_active) ||
      (filterActive === 'inactive' && !gs.is_active);

    const matchesOrg =
      filterOrganization === 'all' ||
      gs.organization_id === Number(filterOrganization);

    const matchesZone =
      filterZone === 'all' ||
      gs.zone_id === Number(filterZone);

    const matchesLocation =
      filterLocation === 'all' ||
      gs.location_id === Number(filterLocation);

    return (
      matchesSearch &&
      matchesActive &&
      matchesOrg &&
      matchesZone &&
      matchesLocation
    );
  });

  const filteredAssignments = employeeAssignments.filter(a => {
    const term = searchTerm.toLowerCase();
    const employeeName = (a.employee_name || '').toLowerCase();
    const orgName = getOrganizationName(a.organization_id).toLowerCase();

    const matchesSearch =
      employeeName.includes(term) ||
      orgName.includes(term);

    const matchesOrg =
      filterOrganization === 'all' ||
      a.organization_id === Number(filterOrganization);

    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && a.is_active) ||
      (filterActive === 'inactive' && !a.is_active);

    return matchesSearch && matchesOrg && matchesActive;
  });

  if (loading && groupSettings.length === 0 && employeeAssignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading location assignment settings...</p>
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
              <h1 className="text-2xl font-bold text-secondary-700">
                Location Assignment Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage group settings and employee group assignments
              </p>
            </div>
            <button
              onClick={
                activeTab === 'group-settings'
                  ? handleCreateGroupSetting
                  : handleCreateAssignment
              }
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeTab === 'group-settings'
                ? 'Add Group Setting'
                : 'Add Employee Assignment'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('group-settings');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'group-settings'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h10M4 18h6"
                  />
                </svg>
                Group Settings
                {groupSettings.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    {groupSettings.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('employee-assignments');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'employee-assignments'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-4-4h-1M7 20H2v-2a4 4 0 014-4h1m4-6a4 4 0 11-8 0 4 4 0 018 0m10 0a4 4 0 11-8 0 4 4 0 018 0"
                  />
                </svg>
                Employee Assignments
                {employeeAssignments.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    {employeeAssignments.length}
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
                  placeholder={`Search ${activeTab === 'group-settings' ? 'group settings' : 'employees'}...`}
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

            {/* Organization filter */}
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

            {/* Site filter (optional for assignments if you relate employee/site) */}
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

            {/* Zone filter (only meaningful for group-settings) */}
            {activeTab === 'group-settings' && (
              <>
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

                <select
                  value={filterLocation}
                  onChange={(e) => {
                    setFilterLocation(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc.location_id} value={loc.location_id}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>
              </>
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
              onClick={
                activeTab === 'group-settings'
                  ? fetchGroupSettings
                  : fetchEmployeeAssignments
              }
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
        {activeTab === 'group-settings' ? (
          // GROUP SETTINGS GRID
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroupSettings.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h10M4 18h6"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No group settings found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm
                    ? 'Try adjusting your search'
                    : 'Click "Add Group Setting" to create your first setting'}
                </p>
              </div>
            ) : (
              filteredGroupSettings.map(gs => (
                <div
                  key={gs.group_setting_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {getOrganizationName(gs.organization_id)}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                          <span>Zone: {getZoneName(gs.zone_id)}</span>
                          <span>•</span>
                          <span>Location: {getLocationName(gs.location_id)}</span>
                        </div>
                        <span
                          className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                            gs.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {gs.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 text-xs text-gray-500">
                    <p>Created: {gs.created_at ? new Date(gs.created_at).toLocaleString() : '-'}</p>
                    <p>Updated: {gs.updated_at ? new Date(gs.updated_at).toLocaleString() : '-'}</p>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      ID: {gs.group_setting_id}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditGroupSetting(gs)}
                        className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGroupSetting(gs.group_setting_id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // EMPLOYEE ASSIGNMENTS GRID
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-4-4h-1M7 20H2v-2a4 4 0 014-4h1m4-6a4 4 0 11-8 0 4 4 0 018 0m10 0a4 4 0 11-8 0 4 4 0 018 0"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No employee assignments found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm
                    ? 'Try adjusting your search'
                    : 'Click "Add Employee Assignment" to assign employees to groups'}
                </p>
              </div>
            ) : (
              filteredAssignments.map(a => (
                <div
                  key={a.employee_group_assignment_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {a.employee_name || `Employee #${a.employee_id}`}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <span>{getOrganizationName(a.organization_id)}</span>
                        </div>
                        <span
                          className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                            a.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {a.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 text-xs text-gray-600 space-y-1">
                    <p>Group setting: {a.group_setting_id}</p>
                    <p>Date: {a.date ? new Date(a.date).toLocaleDateString() : '-'}</p>
                    <p>Created: {a.created_at ? new Date(a.created_at).toLocaleString() : '-'}</p>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      ID: {a.employee_group_assignment_id}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAssignment(a)}
                        className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(a.employee_group_assignment_id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
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
    </div>
  );
}

export default LocationAassingSettings;
