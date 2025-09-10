import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';
import { 
  Home, 
  Users, 
  Clock, 
  Calendar, 
  FileText, 
  BarChart3,
  X,
  Monitor,
  FilePlus,
  FileX,
  LogOut
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home
    },
    { 
      name: 'Employees', 
      href: '/employees', 
      icon: Users
    },
    { 
      name: 'Attendance', 
      href: '/attendance', 
      icon: Clock
    },
    { 
      name: 'Leaves', 
      href: '/leaves', 
      icon: Calendar
    },
    { 
      name: 'Resignations', 
      href: '/resignations', 
      icon: FileX
    },
    { 
      name: 'Documents', 
      href: '/documents', 
      icon: FileText
    },
    { 
      name: 'Generator', 
      href: '/generator', 
      icon: FilePlus
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: BarChart3
    },
    { 
      name: 'Devices', 
      href: '/devices', 
      icon: Monitor
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: Users
    }

  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col h-full`}>
        
        {/* Header with Close Button (Mobile) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.get_full_name?.() || user?.first_name || 'Manager'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.office?.name || 'Office Manager'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
