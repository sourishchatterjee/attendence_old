import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../../services/departmentAPI';

const DepartmentHierarchyModal = ({ organizationId, onClose }) => {
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  useEffect(() => {
    fetchHierarchy();
  }, [organizationId]);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await departmentAPI.getDepartmentHierarchy(organizationId);
      const hierarchyData = response.data || response || [];
      setHierarchy(Array.isArray(hierarchyData) ? hierarchyData : []);
      
      // Expand all top-level nodes by default
      const topLevelIds = new Set(hierarchyData.map(dept => dept.department_id));
      setExpandedNodes(topLevelIds);
    } catch (err) {
      console.error('Fetch hierarchy error:', err);
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map(e => e.message).join(', ');
        setError(`Validation Error: ${errorMessages}`);
      } else {
        setError(err.message || 'Failed to fetch department hierarchy');
      }
      setHierarchy([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const toggleAll = (expand) => {
    if (expand) {
      const allIds = new Set();
      const collectIds = (nodes) => {
        nodes.forEach(node => {
          allIds.add(node.department_id);
          if (node.children && node.children.length > 0) {
            collectIds(node.children);
          }
        });
      };
      collectIds(hierarchy);
      setExpandedNodes(allIds);
    } else {
      setExpandedNodes(new Set());
    }
  };

  const DepartmentNode = ({ department, level = 0 }) => {
    const hasChildren = department.children && department.children.length > 0;
    const isExpanded = expandedNodes.has(department.department_id);

    return (
      <div className={`${level > 0 ? 'ml-6' : ''}`}>
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer ${
            level === 0 ? 'bg-gray-50' : ''
          }`}
          onClick={() => hasChildren && toggleNode(department.department_id)}
        >
          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0 w-6">
            {hasChildren && (
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>

          {/* Department Icon */}
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            level === 0 
              ? 'bg-secondary-200' 
              : level === 1 
              ? 'bg-primary-200' 
              : 'bg-accent-lightBlue'
          }`}>
            <svg className={`w-4 h-4 ${
              level === 0 
                ? 'text-secondary-700' 
                : level === 1 
                ? 'text-primary-700' 
                : 'text-accent-blue'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>

          {/* Department Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium truncate ${
                level === 0 ? 'text-base text-gray-900' : 'text-sm text-gray-800'
              }`}>
                {department.department_name}
              </h4>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-mono">
                {department.department_code}
              </span>
            </div>
          </div>

          {/* Employee Count */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">{department.employee_count || 0}</span>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 border-l-2 border-gray-200 ml-3">
            {department.children.map(child => (
              <DepartmentNode 
                key={child.department_id} 
                department={child} 
                level={level + 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
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
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-accent-lightBlue flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-700">Department Hierarchy</h3>
                <p className="text-sm text-gray-500 mt-0.5">Organizational structure and reporting lines</p>
              </div>
            </div>

            {/* Actions */}
            {!loading && hierarchy.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAll(true)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Expand All
                </button>
                <button
                  onClick={() => toggleAll(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-3"></div>
                <p className="text-gray-500 text-sm">Loading hierarchy...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Error Loading Hierarchy</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            ) : hierarchy.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm font-medium">No departments found</p>
                <p className="text-gray-400 text-xs mt-1">This organization has no departments yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {hierarchy.map(department => (
                  <DepartmentNode 
                    key={department.department_id} 
                    department={department} 
                    level={0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHierarchyModal;
