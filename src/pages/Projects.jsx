import React from 'react';

const Projects = () => {
  const projects = [
    { name: 'Website Redesign', status: 'In Progress', progress: 75, team: 8 },
    { name: 'Mobile App Development', status: 'Planning', progress: 25, team: 12 },
    { name: 'Marketing Campaign', status: 'Completed', progress: 100, team: 5 },
    { name: 'Database Migration', status: 'In Progress', progress: 60, team: 6 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Planning':
        return 'bg-yellow-100 text-yellow-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Portal / Projects</p>
          <h1 className="text-3xl font-bold text-gray-800 mt-1">Projects</h1>
        </div>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
              <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-800">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {[...Array(Math.min(project.team, 4))].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"
                  />
                ))}
                {project.team > 4 && (
                  <div className="w-8 h-8 rounded-full bg-primary-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    +{project.team - 4}
                  </div>
                )}
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
