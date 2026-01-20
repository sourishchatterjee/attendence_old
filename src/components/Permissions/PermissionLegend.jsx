import React from 'react';

const PermissionLegend = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900 mb-2">Permission Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-700"><strong>Create:</strong> Add new records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-gray-700"><strong>Read:</strong> View records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-gray-700"><strong>Update:</strong> Modify records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-gray-700"><strong>Delete:</strong> Remove records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-gray-700"><strong>Export:</strong> Download data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionLegend;
