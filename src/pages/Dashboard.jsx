import React from 'react';
import { 
  HiUsers, 
  HiClock, 
  HiCalendar,
  HiPlus,
  HiDotsVertical,
  HiArrowUp,
  HiArrowDown,
  HiOfficeBuilding,
  HiChevronRight,
  HiCheckCircle,
  HiXCircle,
  HiCurrencyDollar
} from 'react-icons/hi';
import { 
  MdPersonOutline,
  MdPhone,
  MdEmail,
  MdLaptop,
  MdTrendingUp,
  MdAccessTime
} from 'react-icons/md';
import { BsGraphUpArrow, BsFillBriefcaseFill, BsClockHistory } from 'react-icons/bs';
import { IoStatsChart, IoDocumentText } from 'react-icons/io5';
import { FaPaintBrush, FaCode, FaTasks, FaUserClock, FaChartLine } from 'react-icons/fa';
import { AiFillProject, AiFillCheckCircle } from 'react-icons/ai';

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      {/* Compact Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, Jhon 👋</h1>
            <p className="text-sm text-gray-600 mt-1">Here's what's happening with your team today</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-2 text-sm text-gray-700">
              <HiCalendar className="text-base" />
              Nov 18 - 22
            </button>
            <button className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary-500/30">
              <HiPlus className="text-base" />
              Add Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          {/* Top Stats - 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Employees */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <HiUsers className="text-white text-lg" />
                </div>
                <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-md">
                  <HiArrowUp className="text-xs" />
                  12%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">248</h3>
              <p className="text-xs text-gray-600 mt-1">Total Employees</p>
            </div>

            {/* Onsite Team */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/30 group-hover:scale-110 transition-transform">
                  <HiOfficeBuilding className="text-white text-lg" />
                </div>
                <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-md">
                  <HiArrowUp className="text-xs" />
                  2.6%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">80%</h3>
              <p className="text-xs text-gray-600 mt-1">Onsite Team</p>
            </div>

            {/* Remote Team */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-teal to-secondary-600 rounded-lg flex items-center justify-center shadow-md shadow-accent-teal/30 group-hover:scale-110 transition-transform">
                  <MdLaptop className="text-white text-lg" />
                </div>
                <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-md">
                  <HiArrowUp className="text-xs" />
                  2.6%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">20%</h3>
              <p className="text-xs text-gray-600 mt-1">Remote Team</p>
            </div>

            {/* Active Projects */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <AiFillProject className="text-white text-lg" />
                </div>
                <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-md">
                  <HiArrowUp className="text-xs" />
                  8%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">34</h3>
              <p className="text-xs text-gray-600 mt-1">Active Projects</p>
            </div>
          </div>

          {/* Middle Row - Work Time, Profile, Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Work Time - Compact */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HiClock className="text-gray-400 text-base" />
                  <div>
                    <p className="text-xs text-gray-600">Avg work time</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h2 className="text-2xl font-bold text-gray-900">46.5</h2>
                      <span className="text-xs text-gray-500">hrs/week</span>
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-md">
                  <HiArrowUp className="text-xs" />
                  0.5%
                </span>
              </div>
              
              {/* Mini Chart */}
              <div className="flex items-end gap-0.5 h-14 mt-3">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const height = 30 + Math.random() * 70;
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t hover:from-primary-600 transition-all cursor-pointer"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Profile Card - Compact */}
            <div className="bg-gradient-to-br from-accent-teal to-secondary-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
                  alt="Chris Jonathan"
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/20"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold truncate">Chris Jonathan</h3>
                  <p className="text-white/80 text-xs">General Manager</p>
                  <div className="flex items-center gap-1 text-white/70 text-xs mt-1">
                    <BsFillBriefcaseFill className="text-xs" />
                    <span>4+ years</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-sm font-medium">
                  <MdPhone className="text-base" />
                  Call
                </button>
                <button className="flex-1 bg-white hover:bg-gray-50 text-accent-teal py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-sm font-medium">
                  <MdEmail className="text-base" />
                  Email
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Today's Overview</h4>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                      <HiCheckCircle className="text-green-600 text-sm" />
                    </div>
                    <span className="text-xs text-gray-600">Present</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">234</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                      <HiXCircle className="text-red-600 text-sm" />
                    </div>
                    <span className="text-xs text-gray-600">Absent</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">8</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FaUserClock className="text-yellow-600 text-xs" />
                    </div>
                    <span className="text-xs text-gray-600">On Leave</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">6</span>
                </div>
              </div>
            </div>
          </div>

          {/* Track Your Team & Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Track Your Team - Compact */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Total employee</p>
                  <h3 className="text-base font-bold text-gray-900">Track your team</h3>
                </div>
                <button className="w-7 h-7 hover:bg-gray-100 rounded-lg transition-all flex items-center justify-center text-gray-400">
                  <HiChevronRight className="text-lg" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Smaller Donut Chart */}
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#7EC8A0" strokeWidth="10" strokeDasharray={`${(48/93) * 220} 220`} strokeLinecap="round" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#3D6B7D" strokeWidth="10" strokeDasharray={`${(27/93) * 220} 220`} strokeDashoffset={`-${(48/93) * 220}`} strokeLinecap="round" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#D1D5DB" strokeWidth="10" strokeDasharray={`${(18/93) * 220} 220`} strokeDashoffset={`-${((48+27)/93) * 220}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">120</h2>
                        <p className="text-xs text-gray-500">members</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Stats - Compact */}
                <div className="flex flex-col justify-center space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FaPaintBrush className="text-primary-600 text-xs" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Designer</p>
                        <p className="text-xs text-gray-500">48</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FaCode className="text-accent-teal text-xs" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Developer</p>
                        <p className="text-xs text-gray-500">27</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-accent-teal"></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaTasks className="text-gray-600 text-xs" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Manager</p>
                        <p className="text-xs text-gray-500">18</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Performance */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Performance</h3>
                  <p className="text-xs text-gray-600">Department metrics</p>
                </div>
                <button className="w-7 h-7 hover:bg-gray-100 rounded-lg transition-all flex items-center justify-center">
                  <HiDotsVertical className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IoStatsChart className="text-blue-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Design Team</p>
                      <p className="text-xs text-gray-500">92% efficiency</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                    <HiArrowUp className="text-xs" />
                    5%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BsGraphUpArrow className="text-primary-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Dev Team</p>
                      <p className="text-xs text-gray-500">88% efficiency</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                    <HiArrowUp className="text-xs" />
                    3%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <MdPersonOutline className="text-gray-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Management</p>
                      <p className="text-xs text-gray-500">95% efficiency</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                    <HiArrowUp className="text-xs" />
                    2%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Status & Recent Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Status */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Project Status</h3>
                <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">View All</button>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Website Redesign', progress: 75, status: 'On Track', color: 'bg-green-500' },
                  { name: 'Mobile App', progress: 45, status: 'In Progress', color: 'bg-blue-500' },
                  { name: 'Marketing Campaign', progress: 90, status: 'Almost Done', color: 'bg-purple-500' },
                ].map((project, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-900">{project.name}</p>
                      <span className="text-xs text-gray-600 font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className={`${project.color} h-1.5 rounded-full transition-all`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Recent Tasks</h3>
                <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">View All</button>
              </div>

              <div className="space-y-2.5">
                {[
                  { task: 'Update dashboard UI', completed: true, priority: 'High' },
                  { task: 'Review code changes', completed: true, priority: 'Medium' },
                  { task: 'Team meeting prep', completed: false, priority: 'High' },
                  { task: 'Client presentation', completed: false, priority: 'Low' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-all">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${item.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {item.completed ? (
                        <AiFillCheckCircle className="text-green-600 text-sm" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {item.task}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      item.priority === 'High' ? 'bg-red-100 text-red-700' :
                      item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Compact Activity Feed */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Activity</h3>
              <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">View All</button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Syafinah Lan', action: 'submitted timesheet', time: '2 min ago', color: 'bg-blue-500' },
                { name: 'Diwan Lane', action: 'completed project', time: '1 hour ago', color: 'bg-green-500' },
                { name: 'Marvin McKinney', action: 'requested leave', time: '3 hours ago', color: 'bg-yellow-500' },
                { name: 'Eleanor Pena', action: 'joined meeting', time: '5 hours ago', color: 'bg-purple-500' },
                { name: 'Devon Lane', action: 'updated profile', time: 'Yesterday', color: 'bg-pink-500' },
                { name: 'Sarah Wilson', action: 'uploaded docs', time: 'Yesterday', color: 'bg-indigo-500' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className={`w-8 h-8 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-semibold text-xs">
                      {activity.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{activity.name}</p>
                    <p className="text-xs text-gray-600 truncate">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
