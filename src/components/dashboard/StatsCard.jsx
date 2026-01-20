import React from 'react';

const StatsCard = ({ value, label, trend, icon, chartData }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="w-10 h-10 bg-accent-teal text-white rounded-full flex items-center justify-center font-semibold">
            {icon}
          </div>
        )}
        {trend && (
          <span className="flex items-center gap-1 text-primary-500 text-sm font-semibold bg-primary-100 px-2 py-1 rounded-full">
            {trend}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>

      <h2 className="text-4xl font-bold text-gray-800 mb-1">{value}</h2>
      <p className="text-gray-500 text-sm">{label}</p>

      {chartData && (
        <div className="mt-4 flex items-end gap-1 h-12">
          {chartData.map((height, idx) => (
            <div
              key={idx}
              className="flex-1 bg-accent-teal rounded-t"
              style={{ height: `${height * 100}%`, opacity: height > 0.5 ? 1 : 0.3 }}
            />
          ))}
        </div>
      )}

      {!chartData && (
        <div className="mt-4 text-xs text-gray-400">
          2 hours ••••• 10 hours
        </div>
      )}
    </div>
  );
};

export default StatsCard;
