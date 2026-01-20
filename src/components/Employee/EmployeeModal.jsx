import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../services/employeeAPI';
import { siteAPI } from '../../services/siteAPI';
import { departmentAPI } from '../../services/departmentAPI';
import { designationAPI } from '../../services/designationAPI';
import { roleAPI } from '../../services/roleAPI';

const EmployeeModal = ({ employee, organizations, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    // Basic Info
    organization_id: '',
    site_id: '',
    department_id: '',
    designation_id: '',
    role_id: '',
    employee_code: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    marital_status: '',
    nationality: 'Indian',
    
    // Address Info
    current_address: '',
    permanent_address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    
    // Employment Info
    date_of_joining: '',
    employment_type: 'Full-Time',
    reporting_manager_id: '',
    probation_period_months: 6,
    
    // Bank & Documents
    aadhar_number: '',
    pan_number: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sameAddress, setSameAddress] = useState(false);

  const steps = [
    { id: 1, name: 'Basic Information', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 2, name: 'Contact & Address', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { id: 3, name: 'Employment Details', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 4, name: 'Documents & Emergency', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  useEffect(() => {
    if (employee) {
      setFormData({
        organization_id: employee.organization_id || '',
        site_id: employee.site_id || '',
        department_id: employee.department_id || '',
        designation_id: employee.designation_id || '',
        role_id: employee.role_id || '',
        employee_code: employee.employee_code || '',
        first_name: employee.first_name || '',
        middle_name: employee.middle_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        alternate_phone: employee.alternate_phone || '',
        date_of_birth: employee.date_of_birth?.split('T')[0] || '',
        gender: employee.gender || '',
        blood_group: employee.blood_group || '',
        marital_status: employee.marital_status || '',
        nationality: employee.nationality || 'Indian',
        current_address: employee.current_address || '',
        permanent_address: employee.permanent_address || '',
        city: employee.city || '',
        state: employee.state || '',
        country: employee.country || 'India',
        pincode: employee.pincode || '',
        date_of_joining: employee.date_of_joining?.split('T')[0] || '',
        employment_type: employee.employment_type || 'Full-Time',
        reporting_manager_id: employee.reporting_manager_id || '',
        probation_period_months: employee.probation_period_months || 6,
        aadhar_number: employee.aadhar_number || '',
        pan_number: employee.pan_number || '',
        bank_name: employee.bank_name || '',
        account_number: employee.account_number || '',
        ifsc_code: employee.ifsc_code || '',
        branch_name: employee.branch_name || '',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        emergency_contact_relation: employee.emergency_contact_relation || '',
      });
    }
  }, [employee]);

  useEffect(() => {
    if (formData.organization_id) {
      fetchSites(formData.organization_id);
      fetchDepartments(formData.organization_id);
      fetchDesignations(formData.organization_id);
      fetchRoles(formData.organization_id);
      fetchManagers(formData.organization_id);
    }
  }, [formData.organization_id]);

  const fetchSites = async (orgId) => {
    try {
      const response = await siteAPI.getAllSites({ 
        organization_id: parseInt(orgId, 10),
        pageSize: 100 
      });
      setSites(response.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
    }
  };

  const fetchDepartments = async (orgId) => {
    try {
      const response = await departmentAPI.getAllDepartments({ 
        organization_id: parseInt(orgId, 10),
        pageSize: 100 
      });
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchDesignations = async (orgId) => {
    try {
      const response = await designationAPI.getAllDesignations({ 
        organization_id: parseInt(orgId, 10),
        pageSize: 100 
      });
      setDesignations(response.data || []);
    } catch (err) {
      console.error('Error fetching designations:', err);
    }
  };

  const fetchRoles = async (orgId) => {
    try {
      const response = await roleAPI.getAllRoles({ 
        organization_id: parseInt(orgId, 10),
        pageSize: 100 
      });
      setRoles(response.data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchManagers = async (orgId) => {
    try {
      const response = await employeeAPI.getAllEmployees({ 
        organization_id: parseInt(orgId, 10),
        pageSize: 100 
      });
      setManagers(response.data || []);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.organization_id) newErrors.organization_id = 'Organization is required';
      if (!formData.site_id) newErrors.site_id = 'Site is required';
      if (!formData.department_id) newErrors.department_id = 'Department is required';
      if (!formData.designation_id) newErrors.designation_id = 'Designation is required';
      if (!formData.role_id) newErrors.role_id = 'Role is required';
      if (!formData.employee_code.trim()) newErrors.employee_code = 'Employee code is required';
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone is required';
      } else if (!/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone must be 10 digits';
      }
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    if (step === 2) {
      if (!formData.current_address.trim()) newErrors.current_address = 'Current address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
      if (!formData.pincode.trim()) {
        newErrors.pincode = 'Pincode is required';
      } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Pincode must be 6 digits';
      }
    }

    if (step === 3) {
      if (!formData.date_of_joining) newErrors.date_of_joining = 'Date of joining is required';
      if (!formData.employment_type) newErrors.employment_type = 'Employment type is required';
    }

    if (step === 4) {
      if (formData.aadhar_number && !/^[0-9]{12}$/.test(formData.aadhar_number)) {
        newErrors.aadhar_number = 'Aadhar must be 12 digits';
      }
      if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number)) {
        newErrors.pan_number = 'Invalid PAN format (e.g., ABCDE1234F)';
      }
      if (formData.emergency_contact_phone && !/^[0-9]{10}$/.test(formData.emergency_contact_phone)) {
        newErrors.emergency_contact_phone = 'Phone must be 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data with proper type conversions
      const submitData = {
        organization_id: parseInt(formData.organization_id, 10),
        site_id: parseInt(formData.site_id, 10),
        department_id: parseInt(formData.department_id, 10),
        designation_id: parseInt(formData.designation_id, 10),
        role_id: parseInt(formData.role_id, 10),
        employee_code: formData.employee_code.trim(),
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || null,
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        alternate_phone: formData.alternate_phone.trim() || null,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        blood_group: formData.blood_group || null,
        marital_status: formData.marital_status || null,
        nationality: formData.nationality.trim(),
        current_address: formData.current_address.trim(),
        permanent_address: formData.permanent_address.trim() || formData.current_address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        pincode: formData.pincode.trim(),
        date_of_joining: formData.date_of_joining,
        employment_type: formData.employment_type,
        reporting_manager_id: formData.reporting_manager_id ? parseInt(formData.reporting_manager_id, 10) : null,
        probation_period_months: parseInt(formData.probation_period_months, 10),
        aadhar_number: formData.aadhar_number.trim() || null,
        pan_number: formData.pan_number.trim().toUpperCase() || null,
        bank_name: formData.bank_name.trim() || null,
        account_number: formData.account_number.trim() || null,
        ifsc_code: formData.ifsc_code.trim().toUpperCase() || null,
        branch_name: formData.branch_name.trim() || null,
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone.trim() || null,
        emergency_contact_relation: formData.emergency_contact_relation.trim() || null,
      };

      if (employee) {
        await employeeAPI.updateEmployee(employee.employee_id, submitData);
        alert('✅ Employee updated successfully');
      } else {
        await employeeAPI.createEmployee(submitData);
        alert('✅ Employee created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(e => e.message).join('\n');
        alert(`❌ Validation Error:\n${errorMessages}`);
      } else {
        alert(`❌ ${error.message || 'Failed to save employee'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSameAddress = (checked) => {
    setSameAddress(checked);
    if (checked) {
      setFormData({ ...formData, permanent_address: formData.current_address });
    }
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

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary-700">
              {employee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
          </div>

          {/* Steps Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                        currentStep >= step.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs mt-1 text-center ${
                      currentStep >= step.id ? 'text-primary-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition ${
                      currentStep > step.id ? 'bg-primary-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto px-1">
                {/* Organization & Site */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="organization_id"
                      value={formData.organization_id}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.organization_id ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    >
                      <option value="">Select Organization</option>
                      {organizations.map(org => (
                        <option key={org.organization_id} value={org.organization_id}>
                          {org.organization_name}
                        </option>
                      ))}
                    </select>
                    {errors.organization_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.organization_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Site <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="site_id"
                      value={formData.site_id}
                      onChange={handleChange}
                      disabled={!formData.organization_id}
                      className={`w-full px-3 py-2 border ${
                        errors.site_id ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50`}
                    >
                      <option value="">Select Site</option>
                      {sites.map(site => (
                        <option key={site.site_id} value={site.site_id}>
                          {site.site_name}
                        </option>
                      ))}
                    </select>
                    {errors.site_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.site_id}</p>
                    )}
                  </div>
                </div>

                {/* Department & Designation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      disabled={!formData.organization_id}
                      className={`w-full px-3 py-2 border ${
                        errors.department_id ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50`}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.department_id} value={dept.department_id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                    {errors.department_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.department_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="designation_id"
                      value={formData.designation_id}
                      onChange={handleChange}
                      disabled={!formData.organization_id}
                      className={`w-full px-3 py-2 border ${
                        errors.designation_id ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50`}
                    >
                      <option value="">Select Designation</option>
                      {designations.map(desig => (
                        <option key={desig.designation_id} value={desig.designation_id}>
                          {desig.designation_name}
                        </option>
                      ))}
                    </select>
                    {errors.designation_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.designation_id}</p>
                    )}
                  </div>
                </div>

                {/* Role & Employee Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role_id"
                      value={formData.role_id}
                      onChange={handleChange}
                      disabled={!formData.organization_id}
                      className={`w-full px-3 py-2 border ${
                        errors.role_id ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50`}
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                    {errors.role_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.role_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Employee Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employee_code"
                      value={formData.employee_code}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.employee_code ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="EMP001"
                    />
                    {errors.employee_code && (
                      <p className="text-red-500 text-xs mt-1">{errors.employee_code}</p>
                    )}
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="John"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                      placeholder="Michael"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="Doe"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="john.doe@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="9876543210"
                      maxLength="10"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    name="alternate_phone"
                    value={formData.alternate_phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                    placeholder="9876543211"
                    maxLength="10"
                  />
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    />
                    {errors.date_of_birth && (
                      <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Blood Group
                    </label>
                    <select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Marital Status
                    </label>
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nationality
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                      placeholder="Indian"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Address */}
            {currentStep === 2 && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto px-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="current_address"
                    value={formData.current_address}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-3 py-2 border ${
                      errors.current_address ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm`}
                    placeholder="123 Main Street, Apartment 4B"
                  />
                  {errors.current_address && (
                    <p className="text-red-500 text-xs mt-1">{errors.current_address}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={sameAddress}
                    onChange={(e) => handleSameAddress(e.target.checked)}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <label htmlFor="sameAddress" className="text-sm text-gray-700 cursor-pointer">
                    Permanent address same as current address
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Permanent Address
                  </label>
                  <textarea
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    rows="3"
                    disabled={sameAddress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm disabled:opacity-50"
                    placeholder="456 Home Street, Villa 10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="Mumbai"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="Maharashtra"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="India"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.pincode ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="400001"
                      maxLength="6"
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Employment Details */}
            {currentStep === 3 && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto px-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Joining <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_of_joining"
                      value={formData.date_of_joining}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.date_of_joining ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    />
                    {errors.date_of_joining && (
                      <p className="text-red-500 text-xs mt-1">{errors.date_of_joining}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Employment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.employment_type ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                      <option value="Consultant">Consultant</option>
                    </select>
                    {errors.employment_type && (
                      <p className="text-red-500 text-xs mt-1">{errors.employment_type}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Reporting Manager
                    </label>
                    <select
                      name="reporting_manager_id"
                      value={formData.reporting_manager_id}
                      onChange={handleChange}
                      disabled={!formData.organization_id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm disabled:opacity-50"
                    >
                      <option value="">Select Manager</option>
                      {managers.filter(mgr => mgr.employee_id !== employee?.employee_id).map(mgr => (
                        <option key={mgr.employee_id} value={mgr.employee_id}>
                          {mgr.first_name} {mgr.last_name} ({mgr.employee_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Probation Period (Months)
                    </label>
                    <input
                      type="number"
                      name="probation_period_months"
                      value={formData.probation_period_months}
                      onChange={handleChange}
                      min="0"
                      max="12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                      placeholder="6"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents & Emergency */}
            {currentStep === 4 && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto px-1">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Identity Documents</h4>
                  <p className="text-xs text-blue-700">
                    Provide official identity and banking information
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={formData.aadhar_number}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.aadhar_number ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="123456789012"
                      maxLength="12"
                    />
                    {errors.aadhar_number && (
                      <p className="text-red-500 text-xs mt-1">{errors.aadhar_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      name="pan_number"
                      value={formData.pan_number}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.pan_number ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm uppercase`}
                      placeholder="ABCDE1234F"
                      maxLength="10"
                    />
                    {errors.pan_number && (
                      <p className="text-red-500 text-xs mt-1">{errors.pan_number}</p>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
                  <h4 className="text-sm font-semibold text-green-900 mb-1">Bank Details</h4>
                  <p className="text-xs text-green-700">
                    Salary and reimbursements will be credited to this account
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                      placeholder="HDFC Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                      placeholder="12345678901234"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifsc_code"
                      value={formData.ifsc_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm uppercase"
                      placeholder="HDFC0001234"
                      maxLength="11"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      name="branch_name"
                      value={formData.branch_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                      placeholder="Mumbai Main Branch"
                    />
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-4">
                  <h4 className="text-sm font-semibold text-orange-900 mb-1">Emergency Contact</h4>
                  <p className="text-xs text-orange-700">
                    Person to contact in case of emergency
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.emergency_contact_phone ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm`}
                      placeholder="9876543299"
                      maxLength="10"
                    />
                    {errors.emergency_contact_phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Relation
                    </label>
                    <select
                      name="emergency_contact_relation"
                      value={formData.emergency_contact_relation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                    >
                      <option value="">Select Relation</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancel
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50 text-sm"
                >
                  {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
