import React, { useState } from 'react';
import { 
  HiUsers, 
  HiChevronDown, 
  HiChevronRight,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiPlus,
  HiFilter,
  HiDownload,
  HiSearch
} from 'react-icons/hi';
import { MdVerified } from 'react-icons/md';
import { BsBuilding, BsDot, BsTree, BsDiagram3 } from 'react-icons/bs';
import { FiUsers, FiUserCheck, FiLayers, FiTrendingUp } from 'react-icons/fi';

const TeamTree = () => {
  const [expandedNodes, setExpandedNodes] = useState(['ceo', 'cto', 'cfo']);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('pyramid');

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  // Organization Data
  const orgData = {
    id: 'ceo',
    name: 'Chris Jonathan',
    role: 'Chief Executive Officer',
    department: 'Executive',
    email: 'chris.jonathan@company.com',
    phone: '+1 234-567-8900',
    location: 'New York, USA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    verified: true,
    status: 'active',
    reports: 248,
    children: [
      {
        id: 'cto',
        name: 'Sarah Wilson',
        role: 'Chief Technology Officer',
        department: 'Technology',
        email: 'sarah.wilson@company.com',
        phone: '+1 234-567-8901',
        location: 'San Francisco',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
        verified: true,
        status: 'active',
        reports: 85,
        children: [
          {
            id: 'dev-lead',
            name: 'Mike Johnson',
            role: 'Engineering Manager',
            department: 'Engineering',
            email: 'mike.johnson@company.com',
            phone: '+1 234-567-8902',
            location: 'San Francisco',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
            verified: true,
            status: 'active',
            reports: 12,
            children: [
              {
                id: 'dev-1',
                name: 'David Lee',
                role: 'Senior Developer',
                department: 'Engineering',
                email: 'david.lee@company.com',
                phone: '+1 234-567-8903',
                location: 'Remote',
                avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
                verified: true,
                status: 'active',
                reports: 0,
              },
              {
                id: 'dev-2',
                name: 'James Brown',
                role: 'Backend Developer',
                department: 'Engineering',
                email: 'james.brown@company.com',
                phone: '+1 234-567-8904',
                location: 'Remote',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
                verified: false,
                status: 'active',
                reports: 0,
              },
              {
                id: 'dev-3',
                name: 'Alex Kumar',
                role: 'Frontend Developer',
                department: 'Engineering',
                email: 'alex.kumar@company.com',
                phone: '+1 234-567-8905',
                location: 'Remote',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
                verified: false,
                status: 'active',
                reports: 0,
              }
            ]
          },
          {
            id: 'design-lead',
            name: 'Emily Chen',
            role: 'Design Director',
            department: 'Design',
            email: 'emily.chen@company.com',
            phone: '+1 234-567-8906',
            location: 'Los Angeles',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
            verified: true,
            status: 'active',
            reports: 8,
            children: [
              {
                id: 'designer-1',
                name: 'Lisa Anderson',
                role: 'UI/UX Designer',
                department: 'Design',
                email: 'lisa.anderson@company.com',
                phone: '+1 234-567-8907',
                location: 'Remote',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
                verified: true,
                status: 'active',
                reports: 0,
              },
              {
                id: 'designer-2',
                name: 'Sophie Martinez',
                role: 'Product Designer',
                department: 'Design',
                email: 'sophie.martinez@company.com',
                phone: '+1 234-567-8908',
                location: 'Remote',
                avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300',
                verified: false,
                status: 'active',
                reports: 0,
              }
            ]
          }
        ]
      },
      {
        id: 'cfo',
        name: 'Robert Martinez',
        role: 'Chief Financial Officer',
        department: 'Finance',
        email: 'robert.martinez@company.com',
        phone: '+1 234-567-8909',
        location: 'New York',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
        verified: true,
        status: 'active',
        reports: 45,
        children: [
          {
            id: 'finance-manager',
            name: 'Jessica Taylor',
            role: 'Finance Manager',
            department: 'Finance',
            email: 'jessica.taylor@company.com',
            phone: '+1 234-567-8910',
            location: 'New York',
            avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300',
            verified: true,
            status: 'active',
            reports: 8,
          }
        ]
      },
      {
        id: 'cmo',
        name: 'Amanda White',
        role: 'Chief Marketing Officer',
        department: 'Marketing',
        email: 'amanda.white@company.com',
        phone: '+1 234-567-8911',
        location: 'Chicago',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        verified: true,
        status: 'active',
        reports: 35,
      }
    ]
  };

  // Modern Employee Card with Butter-Smooth Animations
  const EmployeeCard = ({ employee, level = 0, hasChildren = false, compact = false }) => {
    const isExpanded = expandedNodes.includes(employee.id);
    const isTopLevel = level === 0;

    return (
      <div className="group">
        <div className={`
          relative bg-white rounded-xl border transition-all duration-500 ease-out
          transform hover:scale-[1.02] hover:-translate-y-1
          ${isTopLevel 
            ? 'border-l-4 border-l-slate-900 border-t border-r border-b border-slate-200 shadow-lg hover:shadow-xl' 
            : 'border-slate-200 hover:border-slate-400 hover:shadow-lg'
          }
          ${compact ? 'max-w-[280px] mx-auto p-3' : 'p-4'}
        `}>
          {/* Animated Status Indicator */}
          <div className="absolute top-3 right-3">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              employee.status === 'active' 
                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' 
                : 'bg-slate-300'
            }`}></div>
          </div>

          <div className="flex items-start gap-3">
            {/* Avatar with Smooth Hover */}
            <div className="relative flex-shrink-0">
              <div className={`
                rounded-xl overflow-hidden ring-2 ring-slate-100 
                transition-all duration-500 ease-out
                hover:ring-4 hover:ring-slate-300 hover:scale-110
                ${isTopLevel ? 'w-16 h-16' : 'w-12 h-12'}
              `}>
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
              {employee.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-white transition-all duration-300 hover:scale-125">
                  <MdVerified className="text-white text-xs" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-slate-900 truncate transition-colors duration-300 hover:text-slate-700 ${
                    isTopLevel ? 'text-base' : 'text-sm'
                  }`}>
                    {employee.name}
                  </h3>
                  <p className="text-xs text-slate-600 truncate">{employee.role}</p>
                </div>
                {hasChildren && (
                  <button
                    onClick={() => toggleNode(employee.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <div className={`transition-transform duration-500 ease-out ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                      <HiChevronDown className="text-slate-600 text-base" />
                    </div>
                  </button>
                )}
              </div>

              {/* Department Badge */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium transition-all duration-300 hover:bg-slate-200 hover:scale-105">
                  <BsBuilding className="text-xs" />
                  {employee.department}
                </span>
                {employee.reports > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors duration-300 hover:text-slate-700">
                    <HiUsers className="text-xs" />
                    {employee.reports}
                  </span>
                )}
              </div>

              {/* Contact Info - Only for Top Level Non-Compact */}
              {isTopLevel && !compact && (
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600 transition-all duration-300 hover:text-slate-900 hover:translate-x-1">
                    <HiMail className="text-sm flex-shrink-0 text-slate-400" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 transition-all duration-300 hover:text-slate-900 hover:translate-x-1">
                    <HiLocationMarker className="text-sm flex-shrink-0 text-slate-400" />
                    <span className="truncate">{employee.location}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons with Butter Animations */}
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                  View Details
                </button>
                <button className="py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95">
                  <HiMail />
                </button>
                <button className="py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95">
                  <HiPhone />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tree Node Renderer (Vertical Layout)
  const TreeNode = ({ node, level = 0 }) => {
    const isExpanded = expandedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="relative">
        <div className="transition-all duration-500 ease-out">
          <EmployeeCard employee={node} level={level} hasChildren={hasChildren} />
        </div>
        
        {hasChildren && (
          <div 
            className={`
              overflow-hidden transition-all duration-700 ease-out
              ${isExpanded ? 'max-h-[5000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}
            `}
          >
            <div className={`relative ${level === 0 ? 'ml-8' : 'ml-10'}`}>
              {/* Animated Connection Line */}
              <div className={`
                absolute left-0 top-0 bottom-4 w-px bg-gradient-to-b from-slate-400 via-slate-300 to-transparent
                transition-all duration-700
                ${isExpanded ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
              `}></div>
              
              <div className="space-y-5">
                {node.children.map((child, index) => (
                  <div 
                    key={child.id} 
                    className="relative pl-8 transition-all duration-500 ease-out"
                    style={{ 
                      transitionDelay: `${index * 100}ms`,
                      transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
                      opacity: isExpanded ? 1 : 0
                    }}
                  >
                    {/* Horizontal Connector with Animation */}
                    <div className={`
                      absolute left-0 top-8 w-8 h-px bg-slate-300
                      transition-all duration-500 ease-out
                      ${isExpanded ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
                    `}></div>
                    {/* Connection Node with Pulse */}
                    <div className={`
                      absolute left-0 top-8 w-3 h-3 bg-white border-2 border-slate-400 rounded-full -translate-x-1.5
                      transition-all duration-500 ease-out hover:scale-150 hover:border-slate-600
                      ${isExpanded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                    `}></div>
                    
                    <TreeNode node={child} level={level + 1} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Pyramid Node Renderer with Smooth Animations
  const PyramidNode = ({ node, level = 0 }) => {
    const isExpanded = expandedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="flex flex-col items-center">
        {/* Current Node with Fade-In */}
        <div 
          className="relative z-10 transition-all duration-500 ease-out transform hover:scale-105"
          style={{
            animation: 'fadeInUp 0.6s ease-out'
          }}
        >
          <EmployeeCard employee={node} level={level} hasChildren={hasChildren} compact={true} />
        </div>

        {/* Children with Staggered Animation */}
        {hasChildren && (
          <div 
            className={`
              relative w-full transition-all duration-700 ease-out
              ${isExpanded ? 'max-h-[3000px] opacity-100 mt-12' : 'max-h-0 opacity-0 mt-0'}
            `}
          >
            {/* Vertical Connector Line from Parent */}
            <div className={`
              absolute left-1/2 -top-12 w-0.5 h-12 bg-gradient-to-b from-slate-400 to-slate-300 -translate-x-1/2 rounded-full
              transition-all duration-700 ease-out origin-top
              ${isExpanded ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}
            `}></div>
            
            {/* Connection Node at Top */}
            <div className={`
              absolute left-1/2 -top-12 w-3 h-3 bg-white border-2 border-slate-400 rounded-full -translate-x-1/2 z-10
              transition-all duration-500 ease-out
              ${isExpanded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
            `}></div>

            {/* Horizontal Line Connecting All Children */}
            {node.children && node.children.length > 1 && (
              <div 
                className={`
                  absolute top-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full
                  transition-all duration-700 ease-out origin-center
                  ${isExpanded ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
                `}
                style={{
                  left: `${(100 / node.children.length) / 2}%`,
                  right: `${(100 / node.children.length) / 2}%`
                }}
              ></div>
            )}

            {/* Children Grid with Stagger Effect */}
            <div className={`grid gap-10 ${
              node.children.length === 1 ? 'grid-cols-1' : 
              node.children.length === 2 ? 'grid-cols-2' : 
              node.children.length === 3 ? 'grid-cols-3' : 
              'grid-cols-4'
            }`}>
              {node.children.map((child, index) => (
                <div 
                  key={child.id} 
                  className="relative transition-all duration-700 ease-out"
                  style={{
                    transitionDelay: `${index * 150}ms`,
                    transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.8)',
                    opacity: isExpanded ? 1 : 0
                  }}
                >
                  {/* Vertical Connector to Each Child */}
                  <div className={`
                    absolute left-1/2 -top-12 w-0.5 h-12 bg-gradient-to-b from-slate-300 to-slate-400 -translate-x-1/2 rounded-full
                    transition-all duration-700 ease-out origin-top
                    ${isExpanded ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}
                  `}
                  style={{ transitionDelay: `${index * 150 + 200}ms` }}
                  ></div>
                  
                  {/* Connection Point */}
                  <div className={`
                    absolute left-1/2 -top-12 w-3 h-3 bg-white border-2 border-slate-400 rounded-full -translate-x-1/2 z-10
                    transition-all duration-500 ease-out hover:scale-150 hover:border-slate-600
                    ${isExpanded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                  `}
                  style={{ transitionDelay: `${index * 150 + 300}ms` }}
                  ></div>
                  
                  <PyramidNode node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="px-6 py-8">
        {/* Organization Chart Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 transition-all duration-500">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Organizational Structure</h2>
              <p className="text-xs text-slate-500">Real-time hierarchy visualization</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle with Butter Animation */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl shadow-inner">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg 
                    transition-all duration-500 ease-out transform
                    ${viewMode === 'tree'
                      ? 'bg-white text-slate-900 shadow-md scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 scale-100'
                    }
                  `}
                >
                  <BsTree className="text-sm transition-transform duration-300 hover:rotate-12" />
                  Tree View
                </button>
                <button
                  onClick={() => setViewMode('pyramid')}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg 
                    transition-all duration-500 ease-out transform
                    ${viewMode === 'pyramid'
                      ? 'bg-white text-slate-900 shadow-md scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 scale-100'
                    }
                  `}
                >
                  <BsDiagram3 className="text-sm transition-transform duration-300 hover:rotate-12" />
                  Pyramid View
                </button>
              </div>

              <div className="w-px h-8 bg-slate-200"></div>

              {/* Expand/Collapse Controls */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setExpandedNodes(['ceo', 'cto', 'cfo', 'cmo', 'dev-lead', 'design-lead', 'finance-manager'])}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Expand All
                </button>
                <BsDot className="text-slate-300" />
                <button 
                  onClick={() => setExpandedNodes(['ceo'])}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>
          
          {/* Render Based on View Mode with Smooth Transition */}
          <div className={`transition-all duration-700 ease-out ${
            viewMode === 'pyramid' ? 'overflow-x-auto' : ''
          }`}>
            <div 
              className="transition-all duration-700 ease-out"
              style={{
                opacity: 1,
                transform: 'scale(1)'
              }}
            >
              {viewMode === 'tree' ? (
                <TreeNode node={orgData} level={0} />
              ) : (
                <div className="min-w-max py-6">
                  <PyramidNode node={orgData} level={0} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamTree;
