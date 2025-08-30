import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  Building2,
  Users,
  Calendar,
  Clock
} from 'lucide-react';

const Header = ({ onMenuClick, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [officeStats, setOfficeStats] = useState({
    employeeCount: 0,
    pendingLeaves: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch real office data from API
  useEffect(() => {
    const fetchOfficeData = async () => {
      if (!user?.office?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch office-specific data
        const [employeesData, leavesData, attendanceData] = await Promise.all([
          api.getManagerEmployees({ limit: 1000 }), // Get all employees for count
          api.getManagerLeaves({ status: 'pending' }),
          api.getTodayAttendance({ limit: 5 }) // Get recent attendance for notifications
        ]);

        setOfficeStats({
          employeeCount: employeesData.results?.length || employeesData.length || 0,
          pendingLeaves: leavesData.results?.length || leavesData.length || 0
        });

        // Create notifications from real data
        const realNotifications = [];
        
        // Add pending leaves notifications
        if (leavesData.results?.length > 0 || leavesData.length > 0) {
          realNotifications.push({
            id: 'pending-leaves',
            type: 'leave',
            title: `${leavesData.results?.length || leavesData.length} leave requests pending`,
            message: 'Review and approve leave requests',
            time: 'Just now',
            icon: 'calendar'
          });
        }

        // Add attendance notifications
        if (attendanceData.results?.length > 0 || attendanceData.length > 0) {
          realNotifications.push({
            id: 'attendance-update',
            type: 'attendance',
            title: 'Attendance update',
            message: `${attendanceData.results?.length || attendanceData.length} employees checked in today`,
            time: '1 hour ago',
            icon: 'clock'
          });
        }

        setNotifications(realNotifications);
      } catch (error) {
        console.error('Failed to fetch office data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchOfficeData();
  }, [user?.office?.id]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-lg border-b-2 border-gray-200 z-40">
      <div className="flex items-center justify-between h-20 px-6 sm:px-8 lg:px-10">
        {/* Left side - Menu button and search */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-50 transition-all duration-300 shadow-sm"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Office Information - Prominently displayed */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {user?.office?.name || 'Office Management'}
                </h1>
                <p className="text-sm text-gray-600">
                  {user?.office?.address || 'Manager Dashboard'}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Office Display */}
          <div className="md:hidden">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  {user?.office?.name || 'Office'}
                </h2>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden lg:block relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              className="block w-80 pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-6">
                     {/* Quick stats - Real API data */}
           <div className="hidden md:flex items-center space-x-4">
             <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
               <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                 <Users className="h-4 w-4" />
               </div>
               <div>
                 <span className="text-sm font-semibold text-blue-900">
                   {loading ? '...' : officeStats.employeeCount}
                 </span>
                 <span className="text-xs text-blue-700 ml-1">Employees</span>
               </div>
             </div>
             <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 shadow-sm">
               <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                 <Bell className="h-4 w-4" />
               </div>
               <div>
                 <span className="text-sm font-semibold text-yellow-900">
                   {loading ? '...' : officeStats.pendingLeaves}
                 </span>
                 <span className="text-xs text-yellow-700 ml-1">Pending</span>
               </div>
             </div>
           </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-50 rounded-xl relative transition-all duration-300 shadow-sm"
            >
                             <Bell className="h-6 w-6" />
               {notifications.length > 0 && (
                 <span className="absolute top-2 right-2 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse border-2 border-white"></span>
               )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 animate-scale-in">
                <div className="py-2">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Office Notifications</h3>
                  </div>
                                     <div className="max-h-80 overflow-y-auto">
                     {notifications.length > 0 ? (
                       notifications.map((notification) => (
                         <div key={notification.id} className="px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border-b border-gray-100 transition-all duration-200">
                           <div className="flex items-start">
                             <div className="flex-shrink-0">
                               <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${
                                 notification.icon === 'calendar' 
                                   ? 'bg-gradient-to-r from-yellow-100 to-orange-100' 
                                   : 'bg-gradient-to-r from-green-100 to-emerald-100'
                               }`}>
                                 {notification.icon === 'calendar' ? (
                                   <Calendar className="h-5 w-5 text-yellow-600" />
                                 ) : (
                                   <Clock className="h-5 w-5 text-green-600" />
                                 )}
                               </div>
                             </div>
                             <div className="ml-4 flex-1">
                               <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                               <p className="text-sm text-gray-600">{notification.message}</p>
                               <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                             </div>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="px-6 py-8 text-center">
                         <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-3">
                           <Bell className="h-6 w-6 text-gray-400" />
                         </div>
                         <p className="text-sm text-gray-500">No notifications</p>
                         <p className="text-xs text-gray-400 mt-1">All caught up!</p>
                       </div>
                     )}
                   </div>
                  <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200">
                      View all notifications
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-4 p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-50 transition-all duration-300 shadow-sm"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center shadow-md">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user?.username || 'Manager'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Manager'} • {user?.email || 'manager@example.com'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 animate-scale-in">
                <div className="py-2">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <p className="text-sm text-gray-600">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.first_name && user?.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user?.username || 'Manager'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Manager'} • {user?.office?.name || 'Office Management'}
                    </p>
                  </div>
                  <button className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200">
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </button>
                  <button className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200">
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </button>
                  <div className="border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50 transition-all duration-200"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
