import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiUser, 
  FiBriefcase, 
  FiFileText, 
  FiImage, 
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSearch
} from 'react-icons/fi'
import { HiOutlineCamera } from 'react-icons/hi'
import { useAuth } from '../../contexts/AuthContext'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const isCreative = user?.role === 'creative'
  
  const creativeNavItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard/creative' },
    { icon: FiUser, label: 'Profile', path: '/dashboard/creative/profile' },
    { icon: FiBriefcase, label: 'Browse Jobs', path: '/requests' },
    { icon: FiFileText, label: 'My Proposals', path: '/dashboard/creative/proposals' },
    { icon: FiImage, label: 'Portfolio', path: '/dashboard/creative/portfolio' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ]

  const clientNavItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard/client' },
    { icon: FiUser, label: 'Profile', path: '/dashboard/client/profile' },
    { icon: FiBriefcase, label: 'My Requests', path: '/dashboard/client/requests' },
    { icon: FiFileText, label: 'Post a Job', path: '/dashboard/client/requests/new' },
    { icon: FiBriefcase, label: 'Browse Creatives', path: '/creatives' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ]

  const navItems = isCreative ? creativeNavItems : clientNavItems

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <HiOutlineCamera className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">Klick n Shoot</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.email?.split('@')[0]}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              <p className="text-xs text-gray-400 mt-1">{user?.subscription} plan</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>

        {/* Subscription Status */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Subscription: {user?.subscription}</p>
            {user?.subscription === 'free' && (
              <Link
                to="/pricing"
                className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600">
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.email?.split('@')[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout