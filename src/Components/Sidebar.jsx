import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Users, 
  Clock, 
  Calendar, 
  FileText, 
  BarChart3,
  User,
  Building2,
  X,
  CheckCircle,
  AlertCircle,
  Monitor
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, onClose }) => {
  const { user } = useAuth();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home,
      description: 'Office overview'
    },
    { 
      name: 'Employees', 
      href: '/employees', 
      icon: Users,
      description: 'Manage team members'
    },
    { 
      name: 'Attendance', 
      href: '/attendance', 
      icon: Clock,
      description: 'Track attendance'
    },
    { 
      name: 'Leaves', 
      href: '/leaves', 
      icon: Calendar,
      description: 'Approve leave requests'
    },
    { 
      name: 'Documents', 
      href: '/documents', 
      icon: FileText,
      description: 'Office documents'
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: BarChart3,
      description: 'Analytics & reports'
    },
    { 
      name: 'Devices', 
      href: '/devices', 
      icon: Monitor,
      description: 'Manage biometric devices'
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User,
      description: 'Your profile'
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`w-72 bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 shadow-2xl border-r-2 border-green-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:block lg:relative lg:inset-0 h-full`}>
        {/* Logo and close button */}
        <div className="flex items-center justify-between h-20 px-6 border-b-2 border-green-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-white to-green-50 flex items-center justify-center mr-4 shadow-lg border-2 border-green-200">
              <Building2 className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Manager Panel</h1>
              <p className="text-sm text-green-200">{user?.office?.name || 'Office'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-3 rounded-xl text-green-200 hover:text-white hover:bg-gradient-to-r hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-sm"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-4 text-sm font-semibold rounded-xl transition-all duration-300 border-2 border-transparent ${
                      isActive
                        ? 'bg-gradient-to-r from-white to-green-50 text-green-900 shadow-lg border-green-200'
                        : 'text-green-100 hover:bg-gradient-to-r hover:from-green-700 hover:to-emerald-700 hover:text-white hover:border-green-600'
                    }`
                  }
                  onClick={onClose}
                  title={item.description}
                >
                  <Icon className={`mr-4 h-6 w-6 ${
                    window.location.pathname === item.href 
                      ? 'text-green-900' 
                      : 'text-green-300 group-hover:text-white'
                  }`} />
                  <span className="flex-1">{item.name}</span>
                  {item.name === 'Leaves' && (
                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-200">
                      3
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="p-6 border-t-2 border-green-700">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-lg border-2 border-green-300">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-semibold text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-green-200 capitalize">
                {user?.role} • {user?.office?.name}
              </p>
            </div>
          </div>
          
          {/* Office status */}
          <div className="p-4 bg-gradient-to-r from-green-800 to-emerald-800 rounded-2xl border-2 border-green-600 shadow-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-green-200 font-medium">Office Status</span>
              <div className="flex items-center">
                <div className="h-3 w-3 bg-green-400 rounded-full mr-2 animate-pulse shadow-sm"></div>
                <span className="text-green-400 font-semibold">Active</span>
              </div>
            </div>
            <div className="text-xs text-green-200">
              <p>Last sync: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
