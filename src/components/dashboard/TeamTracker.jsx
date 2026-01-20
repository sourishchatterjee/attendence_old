import React from 'react';

const TeamTracker = () => {
  const teamData = [
    { role: 'Designer', count: 48, color: 'bg-primary-400' },
    { role: 'Developer', count: 27, color: 'bg-accent-teal' },
    { role: 'Project manager', count: 18, color: 'bg-gray-300' },
  ];

  const totalMembers = 120;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Team Tracker */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total employee</p>
            <h2 className="text-2xl font-bold text-gray-800">Track your team</h2>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="80" fill="none" stroke="#e5e7eb" strokeWidth="24" />
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="#7EC8A0"
              strokeWidth="24"
              strokeDasharray={`${(48 / 93) * 502} 502`}
              strokeLinecap="round"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="#3D6B7D"
              strokeWidth="24"
              strokeDasharray={`${(27 / 93) * 502} 502`}
              strokeDashoffset={`-${(48 / 93) * 502}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-800">{totalMembers}</p>
              <p className="text-sm text-gray-500">Total members</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {teamData.map((item) => (
            <div key={item.role} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-600">{item.role}</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{item.count} members</span>
            </div>
          ))}
        </div>
      </div>

      {/* Talent Recruitment */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500 text-sm mb-1">Hiring statistics</p>
            <h2 className="text-2xl font-bold text-gray-800">Talent recruitment</h2>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 text-center">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              alt="Candidate"
              className="w-16 h-16 rounded-full mx-auto mb-2"
            />
          </div>
          <div className="flex-1 text-center">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
              alt="Candidate"
              className="w-16 h-16 rounded-full mx-auto mb-2"
            />
          </div>
          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-accent-teal text-white rounded-full mx-auto mb-2 flex items-center justify-center font-semibold">
              +5
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">120 Talent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">80 Talent</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex gap-1 h-24 items-end">
              {[0.7, 0.8, 0.6, 0.9, 0.75, 0.85, 0.7, 0.8].map((height, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-primary-400 rounded-t"
                  style={{ height: `${height * 100}%` }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Matched</p>
          </div>
          <div>
            <div className="flex gap-1 h-24 items-end">
              {[0.4, 0.5, 0.3, 0.6, 0.45, 0.55, 0.4, 0.5].map((height, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gray-300 rounded-t"
                  style={{ height: `${height * 100}%` }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Not match</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamTracker;
    