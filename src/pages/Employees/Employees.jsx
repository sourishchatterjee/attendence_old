// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { employeeAPI } from '../../services/employeeAPI';
// import { organizationAPI } from '../../services/organizationAPI';
// import { siteAPI } from '../../services/siteAPI';
// import { departmentAPI } from '../../services/departmentAPI';
// import { designationAPI } from '../../services/designationAPI';
// import EmployeeModal from '../../components/Employee/EmployeeModal';
// import BulkUploadModal from '../../components/Employee/BulkUploadModal';
// import ExportModal from '../../components/Employee/ExportModal';
// import Pagination from '../../components/Pagination';

// const Employees = () => {
//   const navigate = useNavigate();
//   const [employees, setEmployees] = useState([]);
//   const [organizations, setOrganizations] = useState([]);
//   const [sites, setSites] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterActive, setFilterActive] = useState('all');
//   const [filterOrganization, setFilterOrganization] = useState('all');
//   const [filterSite, setFilterSite] = useState('all');
//   const [filterDepartment, setFilterDepartment] = useState('all');
//   const [filterDesignation, setFilterDesignation] = useState('all');
//   const [filterEmploymentType, setFilterEmploymentType] = useState('all');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
//   const [isExportModalOpen, setIsExportModalOpen] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showFilterPanel, setShowFilterPanel] = useState(false);
//   const [selectedEmployees, setSelectedEmployees] = useState(new Set());
//   const [pagination, setPagination] = useState({
//     page: 1,
//     pageSize: 10,
//     totalItems: 0,
//     totalPages: 0,
//   });

//   useEffect(() => {
//     fetchOrganizations();
//     fetchDesignations();
//   }, []);

//   useEffect(() => {
//     if (filterOrganization !== 'all') {
//       fetchSitesByOrganization(filterOrganization);
//       fetchDepartmentsByOrganization(filterOrganization);
//     } else {
//       setSites([]);
//       setDepartments([]);
//       setFilterSite('all');
//       setFilterDepartment('all');
//     }
//   }, [filterOrganization]);

//   useEffect(() => {
//     fetchEmployees();
//   }, [pagination.page, filterActive, filterOrganization, filterSite, filterDepartment, filterDesignation, filterEmploymentType]);

//   const fetchOrganizations = async () => {
//     try {
//       const response = await organizationAPI.getAllOrganizations({ pageSize: 100 });
//       setOrganizations(response.data || []);
//     } catch (err) {
//       console.error('Error fetching organizations:', err);
//     }
//   };

//   const fetchSitesByOrganization = async (orgId) => {
//     try {
//       const response = await siteAPI.getAllSites({ 
//         organization_id: parseInt(orgId, 10),
//         pageSize: 100 
//       });
//       setSites(response.data || []);
//     } catch (err) {
//       console.error('Error fetching sites:', err);
//       setSites([]);
//     }
//   };

//   const fetchDepartmentsByOrganization = async (orgId) => {
//     try {
//       const response = await departmentAPI.getAllDepartments({ 
//         organization_id: parseInt(orgId, 10),
//         pageSize: 100 
//       });
//       setDepartments(response.data || []);
//     } catch (err) {
//       console.error('Error fetching departments:', err);
//       setDepartments([]);
//     }
//   };

//   const fetchDesignations = async () => {
//     try {
//       const response = await designationAPI.getAllDesignations({ pageSize: 100 });
//       setDesignations(response.data || []);
//     } catch (err) {
//       console.error('Error fetching designations:', err);
//     }
//   };

//   const fetchEmployees = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const params = {
//         page: pagination.page,
//         pageSize: pagination.pageSize,
//         search: searchTerm || undefined,
//       };
      
//       if (filterActive !== 'all') {
//         params.is_active = filterActive === 'active';
//       }

//       if (filterOrganization !== 'all') {
//         params.organization_id = parseInt(filterOrganization, 10);
//       }

//       if (filterSite !== 'all') {
//         params.site_id = parseInt(filterSite, 10);
//       }

//       if (filterDepartment !== 'all') {
//         params.department_id = parseInt(filterDepartment, 10);
//       }

//       if (filterDesignation !== 'all') {
//         params.designation_id = parseInt(filterDesignation, 10);
//       }

//       if (filterEmploymentType !== 'all') {
//         params.employment_type = filterEmploymentType;
//       }

//       const response = await employeeAPI.getAllEmployees(params);
      
//       const employeesData = response.data || response || [];
//       setEmployees(Array.isArray(employeesData) ? employeesData : []);
      
//       if (response.pagination) {
//         setPagination(prev => ({
//           ...prev,
//           ...response.pagination,
//         }));
//       } else {
//         setPagination(prev => ({
//           ...prev,
//           totalItems: Array.isArray(employeesData) ? employeesData.length : 0,
//           totalPages: 1,
//         }));
//       }
//     } catch (err) {
//       console.error('Fetch employees error:', err);
      
//       if (err.errors && Array.isArray(err.errors)) {
//         const errorMessages = err.errors.map(e => `${e.field}: ${e.message}`).join(', ');
//         setError(`Validation Error: ${errorMessages}`);
//       } else {
//         setError(err.message || 'Failed to fetch employees');
//       }
      
//       setEmployees([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//     setPagination(prev => ({ ...prev, page: 1 }));
    
//     // Debounce search
//     const timeoutId = setTimeout(() => {
//       fetchEmployees();
//     }, 500);
    
//     return () => clearTimeout(timeoutId);
//   };

//   const handleCreate = () => {
//     setSelectedEmployee(null);
//     setIsModalOpen(true);
//   };

//   const handleEdit = (employee) => {
//     setSelectedEmployee(employee);
//     setIsModalOpen(true);
//   };


//   const handleView = (employeeId) => {
//     //navigate(`/employees/${employeeId}`);
//     console.log(`employeeId ${employeeId}`)
//   };


//   const handleDelete = async (employeeId, employeeName) => {
//     if (window.confirm(`Are you sure you want to delete employee "${employeeName}"?`)) {
//       try {
//         await employeeAPI.deleteEmployee(employeeId);
//         showNotification('Employee deleted successfully', 'success');
//         fetchEmployees();
//       } catch (err) {
//         console.error('Delete employee error:', err);
//         if (err.errors && Array.isArray(err.errors)) {
//           const errorMessages = err.errors.map(e => e.message).join(', ');
//           showNotification(`Error: ${errorMessages}`, 'error');
//         } else {
//           showNotification(err.message || 'Failed to delete employee', 'error');
//         }
//       }
//     }
//   };

//   const handleSelectEmployee = (employeeId) => {
//     setSelectedEmployees(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(employeeId)) {
//         newSet.delete(employeeId);
//       } else {
//         newSet.add(employeeId);
//       }
//       return newSet;
//     });
//   };

//   const handleSelectAll = () => {
//     if (selectedEmployees.size === employees.length) {
//       setSelectedEmployees(new Set());
//     } else {
//       setSelectedEmployees(new Set(employees.map(emp => emp.employee_id)));
//     }
//   };

//   const handleModalClose = () => {
//     setIsModalOpen(false);
//     setSelectedEmployee(null);
//   };

//   const handleModalSuccess = () => {
//     setIsModalOpen(false);
//     setSelectedEmployee(null);
//     fetchEmployees();
//   };

//   const handleDownloadTemplate = async () => {
//     try {
//       await employeeAPI.downloadTemplate();
//       showNotification('Template downloaded successfully', 'success');
//     } catch (err) {
//       console.error('Download template error:', err);
//       showNotification('Failed to download template', 'error');
//     }
//   };

//   const showNotification = (message, type) => {
//     if (type === 'error') {
//       alert(`❌ ${message}`);
//     } else {
//       alert(`✅ ${message}`);
//     }
//   };

//   const getEmploymentTypeBadge = (type) => {
//     const types = {
//       'Full-Time': 'bg-green-100 text-green-800',
//       'Part-Time': 'bg-blue-100 text-blue-800',
//       'Contract': 'bg-orange-100 text-orange-800',
//       'Intern': 'bg-purple-100 text-purple-800',
//       'Consultant': 'bg-pink-100 text-pink-800',
//     };
//     return types[type] || 'bg-gray-100 text-gray-800';
//   };

//   if (loading && employees.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
//           <p className="text-gray-500 mt-4">Loading employees...</p>
//         </div>
//       </div>
//     );
//   }





import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/employeeAPI';
import { organizationAPI } from '../../services/organizationAPI';
import { siteAPI } from '../../services/siteAPI';
import { departmentAPI } from '../../services/departmentAPI';
import { designationAPI } from '../../services/designationAPI';
import EmployeeModal from '../../components/Employee/EmployeeModal';
import BulkUploadModal from '../../components/Employee/BulkUploadModal';
import ExportModal from '../../components/Employee/ExportModal';
import Pagination from '../../components/Pagination';
import { decodeJWT } from "../../utils/jwtHelper";

const Employees = () => {
  const navigate = useNavigate();
  
  const getOrganizationIdFromToken = () => {
    const token = localStorage.getItem("token");
    const payload = decodeJWT(token);
    return payload?.organizationId;
  };

  const [employees, setEmployees] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterSite, setFilterSite] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterDesignation, setFilterDesignation] = useState('all');
  const [filterEmploymentType, setFilterEmploymentType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const orgId = Number(getOrganizationIdFromToken());

  useEffect(() => {
    if (orgId && !isNaN(orgId)) {
      fetchOrganizations();
      fetchDesignationsByOrg();
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId && !isNaN(orgId) && filterOrganization !== 'all') {
      fetchSitesByOrganization(filterOrganization);
      fetchDepartmentsByOrganization(filterOrganization);
    } else {
      setSites([]);
      setDepartments([]);
      setFilterSite('all');
      setFilterDepartment('all');
    }
  }, [filterOrganization, orgId]);

  useEffect(() => {
    if (orgId && !isNaN(orgId)) {
      fetchEmployees();
    }
  }, [pagination.page, filterActive, filterOrganization, filterSite, filterDepartment, filterDesignation, filterEmploymentType, orgId]);

  const fetchOrganizations = async () => {
    try {
      if (!orgId || isNaN(orgId)) {
        console.error("Invalid organization ID:", orgId);
        setOrganizations([]);
        return;
      }

      const response = await organizationAPI.getOrganizationById(orgId);
      setOrganizations(response.data ? [response.data] : []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setOrganizations([]);
    }
  };

  const fetchSitesByOrganization = async (orgIdParam) => {
    try {
      const response = await siteAPI.getAllSites({ 
        organization_id: parseInt(orgIdParam, 10),
        pageSize: 100 
      });
      setSites(response.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
      setSites([]);
    }
  };

  const fetchDepartmentsByOrganization = async (orgIdParam) => {
    try {
      const response = await departmentAPI.getAllDepartments({ 
        organization_id: parseInt(orgIdParam, 10),
        pageSize: 100 
      });
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  const fetchDesignationsByOrg = async () => {
    try {
      if (!orgId || isNaN(orgId)) {
        setDesignations([]);
        return;
      }
      const response = await designationAPI.getAllDesignations({ 
        organization_id: orgId,
        pageSize: 100 
      });
      setDesignations(response.data || []);
    } catch (err) {
      console.error('Error fetching designations:', err);
      setDesignations([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!orgId || isNaN(orgId)) {
        setError("Invalid organization access");
        setEmployees([]);
        setLoading(false);
        return;
      }

      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        organization_id: orgId, // Always filter by user's organization
        search: searchTerm || undefined,
      };
      
      if (filterActive !== 'all') {
        params.is_active = filterActive === 'active';
      }

      if (filterSite !== 'all') {
        params.site_id = parseInt(filterSite, 10);
      }

      if (filterDepartment !== 'all') {
        params.department_id = parseInt(filterDepartment, 10);
      }

      if (filterDesignation !== 'all') {
        params.designation_id = parseInt(filterDesignation, 10);
      }

      if (filterEmploymentType !== 'all') {
        params.employment_type = filterEmploymentType;
      }

      const response = await employeeAPI.getAllEmployees(params);
      
      const employeesData = response.data || response || [];
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      } else {
        setPagination(prev => ({
          ...prev,
          totalItems: Array.isArray(employeesData) ? employeesData.length : 0,
          totalPages: 1,
        }));
      }
    } catch (err) {
      console.error('Fetch employees error:', err);
      
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        setError(`Validation Error: ${errorMessages}`);
      } else {
        setError(err.message || 'Failed to fetch employees');
      }
      
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchEmployees();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleCreate = () => {
    if (!orgId || isNaN(orgId)) {
      alert('No organization access available');
      return;
    }
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleView = (employeeId) => {
    console.log(`employeeId ${employeeId}`);
    // navigate(`/employees/${employeeId}`);
  };

  const handleDelete = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete employee "${employeeName}"?`)) {
      try {
        await employeeAPI.deleteEmployee(employeeId);
        showNotification('Employee deleted successfully', 'success');
        fetchEmployees();
      } catch (err) {
        console.error('Delete employee error:', err);
        if (err.errors && Array.isArray(err.errors)) {
          const errorMessages = err.errors.map(e => e.message).join(', ');
          showNotification(`Error: ${errorMessages}`, 'error');
        } else {
          showNotification(err.message || 'Failed to delete employee', 'error');
        }
      }
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map(emp => emp.employee_id)));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  const handleDownloadTemplate = async () => {
    try {
      await employeeAPI.downloadTemplate();
      showNotification('Template downloaded successfully', 'success');
    } catch (err) {
      console.error('Download template error:', err);
      showNotification('Failed to download template', 'error');
    }
  };

  const showNotification = (message, type) => {
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  const getEmploymentTypeBadge = (type) => {
    const types = {
      'Full-Time': 'bg-green-100 text-green-800',
      'Part-Time': 'bg-blue-100 text-blue-800',
      'Contract': 'bg-orange-100 text-orange-800',
      'Intern': 'bg-purple-100 text-purple-800',
      'Consultant': 'bg-pink-100 text-pink-800',
    };
    return types[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading employees...</p>
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
              <h1 className="text-2xl font-bold text-secondary-700">Employees</h1>
              <p className="text-sm text-gray-500 mt-1">Manage employee information and records</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBulkUploadOpen(true)}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-teal transition font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Upload
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Employee
              </button>
            </div>
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
                  placeholder="Search by name or employee code..."
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

            {/* Site Filter */}
            <select
              value={filterSite}
              onChange={(e) => {
                setFilterSite(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              disabled={filterOrganization === 'all'}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Sites</option>
              {sites.map(site => (
                <option key={site.site_id} value={site.site_id}>
                  {site.site_name}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              disabled={filterOrganization === 'all'}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
            </select>

            {/* More Filters Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                More Filters
                {(filterActive !== 'all' || filterDesignation !== 'all' || filterEmploymentType !== 'all') && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    {[filterActive !== 'all', filterDesignation !== 'all', filterEmploymentType !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>

              {showFilterPanel && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterPanel(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20">
                    <div className="space-y-4">
                      {/* Designation Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Designation</label>
                        <select
                          value={filterDesignation}
                          onChange={(e) => {
                            setFilterDesignation(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          <option value="all">All Designations</option>
                          {designations.map(desig => (
                            <option key={desig.designation_id} value={desig.designation_id}>
                              {desig.designation_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Employment Type Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Employment Type</label>
                        <select
                          value={filterEmploymentType}
                          onChange={(e) => {
                            setFilterEmploymentType(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          <option value="all">All Types</option>
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                          <option value="Consultant">Consultant</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
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

                      {/* Clear Filters */}
                      <button
                        onClick={() => {
                          setFilterDesignation('all');
                          setFilterEmploymentType('all');
                          setFilterActive('all');
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>

            {/* Refresh */}
            <button
              onClick={fetchEmployees}
              disabled={loading}
              className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="font-medium">Error Loading Employees</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedEmployees.size > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-900">
                {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition">
                Deactivate
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition">
                Export Selected
              </button>
              <button
                onClick={() => setSelectedEmployees(new Set())}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Clear Selection
              </button>
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
                    <input 
                      type="checkbox"
                      checked={selectedEmployees.size === employees.length && employees.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
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
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading employees...</p>
                      </div>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 text-sm font-medium">No employees found</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {searchTerm ? 'Try adjusting your search' : 'Click "Add Employee" to create your first employee'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.employee_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.has(employee.employee_id)}
                          onChange={() => handleSelectEmployee(employee.employee_id)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 font-semibold text-primary-600">
                            {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.middle_name && `${employee.middle_name} `}{employee.last_name}
                            </div>
                            <div className="text-xs text-gray-500">Code: {employee.employee_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.designation_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{employee.site_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.email}</div>
                        <div className="text-xs text-gray-500">{employee.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmploymentTypeBadge(employee.employment_type)}`}>
                          {employee.employment_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            employee.is_active ? 'bg-green-600' : 'bg-red-600'
                          }`}></span>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(employee.employee_id)}
                            className="text-accent-blue hover:text-accent-teal transition"
                            title="View"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(employee)}
                            className="text-secondary-500 hover:text-secondary-700 transition"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(employee.employee_id, `${employee.first_name} ${employee.last_name}`)}
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
        <EmployeeModal
          employee={selectedEmployee}
          organizations={organizations}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {isBulkUploadOpen && (
        <BulkUploadModal
          organizations={organizations}
          sites={sites}
          onClose={() => setIsBulkUploadOpen(false)}
          onSuccess={() => {
            setIsBulkUploadOpen(false);
            fetchEmployees();
          }}
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}

      {isExportModalOpen && (
        <ExportModal
          filterOrganization={filterOrganization}
          filterDepartment={filterDepartment}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Employees;
