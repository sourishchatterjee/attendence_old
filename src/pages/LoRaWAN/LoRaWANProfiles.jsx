import React, { useState, useEffect } from 'react';
import { lorawanAPI } from '../../services/lorawanAPI';
import { organizationAPI } from '../../services/organizationAPI';
import DeviceProfileModal from '../../components/LoRaWAN/DeviceProfileModal';
import ProfileDetailsModal from '../../components/LoRaWAN/ProfileDetailsModal';

const LoRaWANProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const lorawanRegions = [
    { value: 'AS923', name: 'AS923 (Asia)' },
    { value: 'AU915', name: 'AU915 (Australia)' },
    { value: 'CN470', name: 'CN470 (China)' },
    { value: 'EU868', name: 'EU868 (Europe)' },
    { value: 'IN865', name: 'IN865 (India)' },
    { value: 'KR920', name: 'KR920 (Korea)' },
    { value: 'US915', name: 'US915 (USA)' },
  ];

  useEffect(() => {
    fetchOrganizations();
    fetchProfiles();
  }, [filterOrganization, filterRegion, filterActive]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      
      if (filterOrganization !== 'all') {
        params.organization_id = parseInt(filterOrganization, 10);
      }
      if (filterRegion !== 'all') {
        params.lorawan_region = filterRegion;
      }
      if (filterActive !== 'all') {
        params.is_active = filterActive === 'true';
      }

      const response = await lorawanAPI.getAllProfiles(params);
      
      const profilesData = response.data || response || [];
      setProfiles(Array.isArray(profilesData) ? profilesData : []);
    } catch (err) {
      console.error('Fetch profiles error:', err);
      setError(err.message || 'Failed to fetch device profiles');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (profile) => {
    try {
      const response = await lorawanAPI.getProfileById(profile.profile_id);
      setSelectedProfile(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching profile details:', err);
      alert(`❌ ${err.message || 'Failed to fetch profile details'}`);
    }
  };

  const handleEditProfile = (profile) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  const handleDeleteProfile = async (profileId, profileName) => {
    if (window.confirm(`Delete device profile "${profileName}"? This action cannot be undone and will affect all associated devices.`)) {
      try {
        await lorawanAPI.deleteProfile(profileId);
        alert('✅ Device profile deleted successfully');
        fetchProfiles();
      } catch (err) {
        console.error('Delete error:', err);
        alert(`❌ ${err.message || 'Failed to delete device profile'}`);
      }
    }
  };

  const getRegionColor = (region) => {
    const colors = {
      'AS923': 'bg-blue-100 text-blue-800',
      'AU915': 'bg-green-100 text-green-800',
      'CN470': 'bg-red-100 text-red-800',
      'EU868': 'bg-purple-100 text-purple-800',
      'IN865': 'bg-orange-100 text-orange-800',
      'KR920': 'bg-pink-100 text-pink-800',
      'US915': 'bg-indigo-100 text-indigo-800',
    };
    return colors[region] || 'bg-gray-100 text-gray-800';
  };

  const getCodecColor = (codec) => {
    const colors = {
      'CUSTOM': 'bg-purple-100 text-purple-800',
      'CAYENNE_LPP': 'bg-green-100 text-green-800',
      'JSON': 'bg-blue-100 text-blue-800',
      'NONE': 'bg-gray-100 text-gray-800',
    };
    return colors[codec] || 'bg-gray-100 text-gray-800';
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm) return true;
    const name = (profile.profile_name || '').toLowerCase();
    const description = (profile.profile_description || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
  });

  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading device profiles...</p>
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
              <h1 className="text-2xl font-bold text-secondary-700">LoRaWAN Device Profiles</h1>
              <p className="text-sm text-gray-500 mt-1">Manage LoRaWAN device configuration profiles</p>
            </div>
            <button
              onClick={() => {
                setSelectedProfile(null);
                setIsProfileModalOpen(true);
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Profile
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Profiles</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
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
                <p className="text-sm text-gray-600">Active Profiles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Custom Codecs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.filter(p => p.payload_codec === 'CUSTOM').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.reduce((sum, p) => sum + (p.device_count || 0), 0)}
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
                placeholder="Search profiles..."
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
              onChange={(e) => setFilterOrganization(e.target.value)}
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
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">All Regions</option>
              {lorawanRegions.map(region => (
                <option key={region.value} value={region.value}>{region.name}</option>
              ))}
            </select>

            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <button
              onClick={fetchProfiles}
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

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No device profiles found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Click "Create Profile" to add your first device profile'}
              </p>
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <div
                key={profile.profile_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
              >
                {/* Profile Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {profile.profile_name || 'Unnamed Profile'}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRegionColor(profile.lorawan_region || 'IN865')}`}>
                          {profile.lorawan_region || 'IN865'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCodecColor(profile.payload_codec || 'NONE')}`}>
                          {profile.payload_codec || 'NONE'}
                        </span>
                      </div>
                    </div>
                    {profile.is_active ? (
                      <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-400 text-white rounded-full text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Card Body */}
                <div className="p-4 space-y-3">
                  {/* Organization */}
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-600 truncate">{profile.organization_name || 'N/A'}</span>
                  </div>

                  {/* Description */}
                  {profile.profile_description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {profile.profile_description}
                    </p>
                  )}

                  {/* LoRaWAN Version */}
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700">LoRaWAN:</span>
                      <span className="font-semibold text-blue-900">{profile.lorawan_version || '1.0.3'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-blue-700">MAC:</span>
                      <span className="font-semibold text-blue-900">{profile.mac_version || '1.0.3'}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5">
                    {profile.supports_otaa && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        OTAA
                      </span>
                    )}
                    {profile.supports_class_b && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Class B
                      </span>
                    )}
                    {profile.supports_class_c && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        Class C
                      </span>
                    )}
                  </div>

                  {/* Device Count */}
                  <div className="flex items-center gap-2 text-sm bg-gray-50 rounded p-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    <span className="text-gray-600">Devices:</span>
                    <span className="font-semibold text-gray-900">{profile.device_count || 0}</span>
                  </div>
                </div>

                {/* Profile Card Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleViewDetails(profile)}
                    className="px-3 py-1.5 text-primary-600 hover:bg-primary-50 rounded transition text-sm font-medium"
                    title="View Details"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleEditProfile(profile)}
                    className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(profile.profile_id, profile.profile_name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {isProfileModalOpen && (
        <DeviceProfileModal
          profile={selectedProfile}
          organizations={organizations}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedProfile(null);
          }}
          onSuccess={() => {
            setIsProfileModalOpen(false);
            setSelectedProfile(null);
            fetchProfiles();
          }}
        />
      )}

      {isDetailsModalOpen && selectedProfile && (
        <ProfileDetailsModal
          profile={selectedProfile}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedProfile(null);
          }}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsProfileModalOpen(true);
          }}
          onRefresh={fetchProfiles}
        />
      )}
    </div>
  );
};

export default LoRaWANProfiles;
