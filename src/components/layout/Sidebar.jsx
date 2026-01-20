import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
// Material Design Icons
import { MdDashboard, MdCalendarToday, MdFolder, MdPeople, MdDescription, MdBorderAll } from 'react-icons/md';
// Ionicons
import { IoLogOut, IoSettingsSharp, IoNotifications, IoChevronDown, IoChevronUp } from 'react-icons/io5';
// Hero Icons
import { HiSupport, HiChartBar, HiUsers } from 'react-icons/hi';
// Font Awesome
import { FaBolt, FaChartLine, FaUserFriends, FaSitemap } from 'react-icons/fa';
// Bootstrap Icons
import { BsFillBellFill, BsGearFill, BsBuildings } from 'react-icons/bs';
import { FaUserTag } from "react-icons/fa6";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { GoOrganization } from "react-icons/go";
// Remix Icons
import { RiDashboardFill, RiTeamFill } from 'react-icons/ri';
import LogoImage from '../../assets/image/logo.png';

const Sidebar = () => {
  const [openSubmenus, setOpenSubmenus] = useState({});

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: RiDashboardFill,
      badge: null 
    },
    { 
      name: 'Organization', 
      path: '/organization', 
      icon: GoOrganization,
      badge: null,
      subMenu: [
        { name: 'Sites', path: '/organization/sites', icon: MdBorderAll },
        { name: 'Departments', path: '/organization/departments', icon: BsBuildings },
        { name: 'Designations', path: '/organization/designations', icon: FaUserTag }
      ]
    },
    { 
      name: 'Human Resources', 
      path: '/hr', 
      icon: HiUsers,
      badge: null,
      




      subMenu: [
        { name: 'Employees', path: '/hr/employees', icon: AiOutlineUsergroupAdd },
        { name: 'Roles', path: '/hr/roles', icon: FaUserFriends },
        { name: 'Permissions', path: '/hr/permissions', icon: FaUserFriends },
        { name: 'Attendance', path: '/hr/attendance', icon: MdCalendarToday },
        { name: 'Leaves', path: '/hr/leaves', icon: MdDescription },
        { name: 'Salary', path: '/hr/salary', icon: FaChartLine },
        { name: 'Payroll', path: '/hr/payroll', icon: FaBolt }
      ]
    },
    { 
      name: 'Workforce', 
      path: '/workforce', 
      icon: RiTeamFill,
      badge: '3',
      subMenu: [
        { name: 'Shifts', path: '/workforce/shifts', icon: MdCalendarToday },
        { name: 'Locations', path: '/workforce/locations', icon: MdFolder }
      ]
    },
    { 
      name: 'IoT Management', 
      path: '/iot', 
      icon: FaBolt,
      badge: null,
      subMenu: [
        { name: 'LoRaWAN Profiles', path: '/iot/lorawan-profiles', icon: FaSitemap },
        { name: 'LoRaWAN Gateways', path: '/iot/lorawan-gateways', icon: BsGearFill },
        { name: 'Devices', path: '/iot/devices', icon: MdFolder },
        { name: 'Device Data', path: '/iot/device-data', icon: HiChartBar },
        { name: 'Applications', path: '/iot/applications', icon: MdDescription },
        { name: 'Geofences', path: '/iot/geofences', icon: MdBorderAll }
      ]
    },
    { 
      name: 'Projects', 
      path: '/projects', 
      icon: MdFolder,
      badge: '12' 
    },
    { 
      name: 'Team Tree', 
      path: '/team-tree', 
      icon: FaSitemap,
      badge: null 
    },
    { 
      name: 'Calendar', 
      path: '/calendar', 
      icon: MdCalendarToday,
      badge: null 
    },
    { 
      name: 'Documents', 
      path: '/documents', 
      icon: MdDescription,
      badge: '3' 
    },
  ];

  const toggleSubmenu = (itemName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const renderNavItem = (item) => {
    const hasSubMenu = item.subMenu && item.subMenu.length > 0;
    const isSubmenuOpen = openSubmenus[item.name];

    if (hasSubMenu) {
      return (
        <div key={item.name} className="space-y-1">
          <button
            onClick={() => toggleSubmenu(item.name)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <div className="flex items-center gap-3">
              <item.icon className="text-xl text-gray-500 transition-transform group-hover:scale-110" />
              <span className="font-medium text-sm">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="text-xs px-2 py-1 rounded-full font-semibold bg-primary-100 text-primary-600">
                  {item.badge}
                </span>
              )}
              {isSubmenuOpen ? (
                <IoChevronUp className="text-sm text-gray-500" />
              ) : (
                <IoChevronDown className="text-sm text-gray-500" />
              )}
            </div>
          </button>

          {/* Submenu Items */}
          {isSubmenuOpen && (
            <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1">
              {item.subMenu.map((subItem) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <subItem.icon className={`text-lg ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className="font-medium text-sm">{subItem.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Regular menu item without submenu
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
            isActive
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3">
              <item.icon 
                className={`text-xl transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`} 
              />
              <span className="font-medium text-sm">{item.name}</span>
            </div>
            {item.badge && (
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                isActive 
                  ? 'bg-white text-primary-500' 
                  : 'bg-primary-100 text-primary-600'
              }`}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="border-b border-gray-100">
        <div className="w-full">
          <img 
            src={LogoImage}
            alt="Logo" 
            className="w-full h-19 object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => renderNavItem(item))}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Additional Options */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group">
            <IoSettingsSharp className="text-xl text-gray-500 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium text-sm">Settings</span>
          </button>
          
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
            <div className="flex items-center gap-3">
              <IoNotifications className="text-xl text-gray-500" />
              <span className="font-medium text-sm">Notifications</span>
            </div>
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </nav>

      {/* Help Section */}
      {/* <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-accent-teal to-secondary-600 rounded-2xl p-4 text-white">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
            <HiSupport className="text-white text-xl" />
          </div>
          <p className="text-sm font-semibold mb-1">Need Help?</p>
          <p className="text-xs text-white/80 mb-3">Contact support team</p>
          <button className="w-full bg-white text-accent-teal text-sm font-semibold py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg">
            Get Support
          </button>
        </div>
      </div> */}



    </div>
  );
};

export default Sidebar;
