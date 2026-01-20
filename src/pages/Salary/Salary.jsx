import React, { useState, useEffect } from 'react';
import { salaryAPI } from '../../services/salaryAPI';
import { employeeAPI } from '../../services/employeeAPI';
import { organizationAPI } from '../../services/organizationAPI';
import ComponentModal from '../../components/Salary/ComponentModal';
import SalaryStructureModal from '../../components/Salary/SalaryStructureModal';
import StructureDetailsModal from '../../components/Salary/StructureDetailsModal';

const Salary = () => {
  const [activeTab, setActiveTab] = useState('components'); // 'components', 'structures'
  const [components, setComponents] = useState([]);
  const [structures, setStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterComponentType, setFilterComponentType] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);

  useEffect(() => {
    fetchOrganizations();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (activeTab === 'components') {
      fetchComponents();
    } else {
      fetchStructures();
    }
  }, [activeTab, filterOrganization, filterComponentType, filterEmployee]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAllEmployees({ pageSize: 100 });
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      
      if (filterOrganization !== 'all') {
        params.organization_id = parseInt(filterOrganization, 10);
      }
      if (filterComponentType !== 'all') {
        params.component_type = filterComponentType;
      }

      const response = await salaryAPI.getAllComponents(params);
      
      const componentsData = response.data || response || [];
      setComponents(Array.isArray(componentsData) ? componentsData : []);
    } catch (err) {
      console.error('Fetch components error:', err);
      setError(err.message || 'Failed to fetch components');
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStructures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For structures, we need to fetch all employees' structures
      // Since API requires employee_id, we'll fetch for selected employee or show message
      if (filterEmployee === 'all') {
        setStructures([]);
        setLoading(false);
        return;
      }

      const response = await salaryAPI.getEmployeeStructure({
        employee_id: filterEmployee,
      });
      
      const structuresData = response.data || response || [];
      setStructures(Array.isArray(structuresData) ? structuresData : []);
    } catch (err) {
      console.error('Fetch structures error:', err);
      setError(err.message || 'Failed to fetch structures');
      setStructures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStructure = async (structure) => {
    try {
      const response = await salaryAPI.getStructureById(structure.salary_structure_id);
      setSelectedStructure(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching structure details:', err);
      alert(`❌ ${err.message || 'Failed to fetch structure details'}`);
    }
  };

  const handleEditComponent = (component) => {
    setSelectedComponent(component);
    setIsComponentModalOpen(true);
  };

  const handleDeleteComponent = async (componentId, componentName) => {
    if (window.confirm(`Delete component "${componentName}"? This action cannot be undone.`)) {
      try {
        await salaryAPI.deleteComponent(componentId);
        showNotification('Component deleted successfully', 'success');
        fetchComponents();
      } catch (err) {
        console.error('Delete error:', err);
        showNotification(err.message || 'Failed to delete component', 'error');
      }
    }
  };

  const handleDeleteStructure = async (structureId, employeeName) => {
    if (window.confirm(`Delete salary structure for "${employeeName}"? This action cannot be undone.`)) {
      try {
        await salaryAPI.deleteStructure(structureId);
        showNotification('Salary structure deleted successfully', 'success');
        fetchStructures();
      } catch (err) {
        console.error('Delete error:', err);
        showNotification(err.message || 'Failed to delete structure', 'error');
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

  const getComponentTypeColor = (type) => {
    const colors = {
      'Earning': 'bg-green-100 text-green-800',
      'Deduction': 'bg-red-100 text-red-800',
      'Allowance': 'bg-blue-100 text-blue-800',
      'Reimbursement': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Fixed filtering with null safety
  const filteredComponents = components.filter(comp => {
    if (!searchTerm) return true;
    const name = comp?.component_name || '';
    const code = comp?.component_code || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredStructures = structures.filter(struct => {
    if (!searchTerm) return true;
    const name = struct?.employee_name || '';
    const code = struct?.employee_code || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading && (components.length === 0 && structures.length === 0)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading salary data...</p>
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
              <h1 className="text-2xl font-bold text-secondary-700">Salary Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage salary components and structures</p>
            </div>
            <button
              onClick={() => {
                if (activeTab === 'components') {
                  setSelectedComponent(null);
                  setIsComponentModalOpen(true);
                } else {
                  setIsStructureModalOpen(true);
                }
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeTab === 'components' ? 'Add Component' : 'Create Structure'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('components');
                setSearchTerm('');
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'components'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Salary Components
                {components.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    {components.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('structures');
                setSearchTerm('');
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'structures'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Salary Structures
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

            {activeTab === 'components' && (
              <>
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
                  value={filterComponentType}
                  onChange={(e) => setFilterComponentType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="Earning">Earning</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Allowance">Allowance</option>
                  <option value="Reimbursement">Reimbursement</option>
                </select>
              </>
            )}

            {activeTab === 'structures' && (
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm"
              >
                <option value="all">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={activeTab === 'components' ? fetchComponents : fetchStructures}
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
        {activeTab === 'components' ? (
          /* Components Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComponents.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No salary components found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search' : 'Click "Add Component" to create your first salary component'}
                </p>
              </div>
            ) : (
              filteredComponents.map((component) => (
                <div
                  key={component.component_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
                >
                  {/* Component Card Header */}
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {component.component_name || 'Unnamed Component'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-mono">
                            {component.component_code || 'N/A'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getComponentTypeColor(component.component_type || 'Earning')}`}>
                            {component.component_type || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Component Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Organization */}
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-600 truncate">{component.organization_name || 'N/A'}</span>
                    </div>

                    {/* Calculation Type */}
                    <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-blue-900 font-semibold">
                        {component.calculation_type || 'Fixed'}
                      </span>
                    </div>

                    {/* Properties */}
                    <div className="flex flex-wrap gap-1.5">
                      {component.is_taxable && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                          Taxable
                        </span>
                      )}
                      {component.is_fixed && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          Fixed
                        </span>
                      )}
                      {component.display_in_payslip && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          In Payslip
                        </span>
                      )}
                    </div>

                    {/* Sort Order */}
                    <div className="text-xs text-gray-500">
                      Display Order: #{component.sort_order || 1}
                    </div>
                  </div>

                  {/* Component Card Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${
                      component.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {component.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditComponent(component)}
                        className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteComponent(component.component_id, component.component_name)}
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
          /* Structures List */
          <div className="space-y-4">
            {filterEmployee === 'all' ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">Select an employee to view salary structure</p>
              </div>
            ) : filteredStructures.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No salary structure found</p>
                <p className="text-gray-400 text-sm mt-1">Click "Create Structure" to set up salary for this employee</p>
              </div>
            ) : (
              filteredStructures.map((structure) => (
                <div
                  key={structure.salary_structure_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
                >
                  {/* Structure Header */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {(structure.employee_name || 'NA').split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{structure.employee_name || 'Unknown Employee'}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {structure.employee_code || 'N/A'}
                            {structure.is_current && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-semibold">
                                Current
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Annual CTC</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {formatCurrency(structure.ctc_annual)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Structure Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-700 mb-1">Monthly CTC</p>
                        <p className="text-xl font-bold text-blue-900">{formatCurrency(structure.ctc_monthly)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-green-700 mb-1">Gross Salary</p>
                        <p className="text-xl font-bold text-green-900">{formatCurrency(structure.gross_salary)}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-purple-700 mb-1">Net Salary</p>
                        <p className="text-xl font-bold text-purple-900">{formatCurrency(structure.net_salary)}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <p className="text-sm text-orange-700 mb-1">Payment Mode</p>
                        <p className="text-sm font-bold text-orange-900">{structure.payment_mode || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Effective Dates */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Effective From: <strong>{formatDate(structure.effective_from)}</strong></span>
                      </div>
                      {structure.effective_to && (
                        <div className="flex items-center gap-2">
                          <span>To: <strong>{formatDate(structure.effective_to)}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Components Preview */}
                    {structure.components && structure.components.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Components ({structure.components.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {structure.components.slice(0, 6).map((comp, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-lg text-xs font-medium ${getComponentTypeColor(comp.component_type || 'Earning')}`}
                            >
                              {comp.component_code || 'N/A'}: {formatCurrency(comp.amount)}
                            </span>
                          ))}
                          {structure.components.length > 6 && (
                            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
                              +{structure.components.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Structure Actions */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewStructure(structure)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteStructure(structure.salary_structure_id, structure.employee_name)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isComponentModalOpen && (
        <ComponentModal
          component={selectedComponent}
          organizations={organizations}
          onClose={() => {
            setIsComponentModalOpen(false);
            setSelectedComponent(null);
          }}
          onSuccess={() => {
            setIsComponentModalOpen(false);
            setSelectedComponent(null);
            fetchComponents();
          }}
        />
      )}

      {isStructureModalOpen && (
        <SalaryStructureModal
          employees={employees}
          components={components}
          onClose={() => setIsStructureModalOpen(false)}
          onSuccess={() => {
            setIsStructureModalOpen(false);
            fetchStructures();
          }}
        />
      )}

      {isDetailsModalOpen && selectedStructure && (
        <StructureDetailsModal
          structure={selectedStructure}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedStructure(null);
          }}
          onRefresh={fetchStructures}
        />
      )}
    </div>
  );
};

export default Salary;
