import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/leaveAPI';

const LeaveDetailsModal = ({ application, onClose, onRefresh }) => {
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);
  const [approverRemarks, setApproverRemarks] = useState('');

  useEffect(() => {
    if (application?.leave_application_id) {
      fetchDetailedApplication();
    }
  }, [application]);

  const fetchDetailedApplication = async () => {
    try {
      const response = await leaveAPI.getLeaveApplicationById(application.leave_application_id);
      setDetailedData(response.data);
    } catch (err) {
      console.error('Error fetching application details:', err);
    }
  };

  const handleProcess = async (status) => {
    if (!approverRemarks.trim() && status === 'Rejected') {
      alert('Please provide remarks for rejection');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave application?`)) {
      return;
    }

    setProcessingAction(status);
    setLoading(true);

    try {
      await leaveAPI.processLeaveApplication(application.leave_application_id, {
        status,
        approver_remarks: approverRemarks.trim() || null,
      });
      alert(`✅ Leave ${status.toLowerCase()} successfully`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Process error:', err);
      alert(`❌ ${err.message || 'Failed to process leave'}`);
    } finally {
      setLoading(false);
      setProcessingAction(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    setLoading(true);

    try {
      await leaveAPI.cancelLeaveApplication(application.leave_application_id);
      alert('✅ Leave application cancelled successfully');
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Cancel error:', err);
      alert(`❌ ${err.message || 'Failed to cancel leave'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
    };
    return statuses[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!detailedData) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>
          <div className="relative bg-white rounded-xl p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading details...</p>
          </div>
        </div>
      </div>
    );
  }

  const isPending = detailedData.status === 'Pending';
  const canCancel = detailedData.status === 'Pending' || detailedData.status === 'Approved';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-700">Leave Application Details</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Application ID: #{detailedData.leave_application_id}
                </p>
              </div>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(detailedData.status)}`}>
              {detailedData.status}
            </span>
          </div>

          {/* Employee Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Employee Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-600">Name</p>
                <p className="font-semibold text-blue-900">{detailedData.employee_name}</p>
              </div>
              <div>
                <p className="text-blue-600">Employee Code</p>
                <p className="font-semibold text-blue-900">{detailedData.employee_code}</p>
              </div>
              <div>
                <p className="text-blue-600">Department</p>
                <p className="font-semibold text-blue-900">{detailedData.department_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-blue-600">Designation</p>
                <p className="font-semibold text-blue-900">{detailedData.designation_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="text-sm font-semibold text-green-900 mb-3">Leave Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-green-600">Leave Type</p>
                  <p className="font-semibold text-green-900">{detailedData.leave_type_name}</p>
                </div>
                <div>
                  <p className="text-green-600">Total Days</p>
                  <p className="text-2xl font-bold text-green-900">{detailedData.total_days}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-900 mb-3">Leave Period</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-purple-600">From Date</p>
                  <p className="font-semibold text-purple-900">{formatDate(detailedData.from_date)}</p>
                </div>
                <div>
                  <p className="text-purple-600">To Date</p>
                  <p className="font-semibold text-purple-900">{formatDate(detailedData.to_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Reason</h4>
            <p className="text-sm text-gray-700">{detailedData.reason}</p>
          </div>

          {/* Application Timeline */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 mb-6">
            <h4 className="text-sm font-semibold text-indigo-900 mb-3">Application Timeline</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-indigo-600">Applied Date:</span>
                <span className="font-semibold text-indigo-900">{formatDateTime(detailedData.applied_date)}</span>
              </div>
              {detailedData.approved_rejected_date && (
                <>
                  <div className="flex justify-between">
                    <span className="text-indigo-600">Processed Date:</span>
                    <span className="font-semibold text-indigo-900">{formatDateTime(detailedData.approved_rejected_date)}</span>
                  </div>
                  {detailedData.approved_rejected_by_name && (
                    <div className="flex justify-between">
                      <span className="text-indigo-600">Processed By:</span>
                      <span className="font-semibold text-indigo-900">{detailedData.approved_rejected_by_name}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Approver Remarks (if exists) */}
          {detailedData.approver_remarks && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">Approver Remarks</h4>
              <p className="text-sm text-yellow-800">{detailedData.approver_remarks}</p>
            </div>
          )}

          {/* Action Section */}
          {isPending && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Process Application</h4>
              <textarea
                value={approverRemarks}
                onChange={(e) => setApproverRemarks(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-sm mb-3"
                placeholder="Enter remarks (optional for approval, required for rejection)..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleProcess('Approved')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-50"
                >
                  {processingAction === 'Approved' && loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Approving...
                    </span>
                  ) : (
                    '✓ Approve'
                  )}
                </button>
                <button
                  onClick={() => handleProcess('Rejected')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50"
                >
                  {processingAction === 'Rejected' && loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Rejecting...
                    </span>
                  ) : (
                    '✕ Reject'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50"
              >
                {loading && processingAction === null ? 'Cancelling...' : 'Cancel Leave'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailsModal;
