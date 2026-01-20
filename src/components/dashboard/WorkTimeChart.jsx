import React from 'react';

const WorkTimeChart = () => {
  const workHours = 46;
  const trend = '+0.5%';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 text-sm mb-1">Average work time</p>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-bold text-gray-800">{workHours} hours</h2>
            <span className="flex items-center gap-1 text-primary-500 text-sm font-semibold bg-primary-100 px-2 py-1 rounded-full">
              {trend}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-32">
        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path
            d="M 0,50 Q 50,20 100,30 T 200,40 T 300,35 T 400,45"
            fill="none"
            stroke="#7EC8A0"
            strokeWidth="2"
          />
          <path
            d="M 0,50 Q 50,20 100,30 T 200,40 T 300,35 T 400,45 L 400,100 L 0,100 Z"
            fill="url(#gradient)"
            opacity="0.2"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7EC8A0" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7EC8A0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-semibold">
          13 h/d
        </div>
      </div>

      <div className="flex justify-between mt-4 text-xs text-gray-400">
        <span>0 H</span>
        <span>8 H</span>
        <span>4 H</span>
        <span>6 H</span>
      </div>

      <p className="text-xs text-gray-400 mt-2">⏱️ Total work hours include only extra hours</p>
    </div>
  );
};

export default WorkTimeChart;
