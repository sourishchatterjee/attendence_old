import React from 'react';

const Calendar = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-500 text-sm">Portal / Calendar</p>
        <h1 className="text-3xl font-bold text-gray-800 mt-1">Calendar</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="text-center py-20">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Calendar View</h2>
          <p className="text-gray-500">Calendar functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
