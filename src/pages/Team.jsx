import React from 'react';

const Team = () => {
  const members = [
    { name: 'Chris Jonathan', role: 'General Manager', email: 'chris@lordbank.com', status: 'Active' },
    { name: 'Sarah Wilson', role: 'Designer', email: 'sarah@lordbank.com', status: 'Active' },
    { name: 'Mike Johnson', role: 'Developer', email: 'mike@lordbank.com', status: 'Active' },
    { name: 'Emily Brown', role: 'Project Manager', email: 'emily@lordbank.com', status: 'Away' },
    { name: 'David Lee', role: 'Developer', email: 'david@lordbank.com', status: 'Active' },
    { name: 'Lisa Chen', role: 'Designer', email: 'lisa@lordbank.com', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Portal / Team</p>
          <h1 className="text-3xl font-bold text-gray-800 mt-1">Team Members</h1>
        </div>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
          + Add Member
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{member.role}</td>
                  <td className="px-6 py-4 text-gray-600">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Team;
