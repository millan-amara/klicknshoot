import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiUsers, 
  FiCheckCircle, 
  FiDollarSign, 
  FiBarChart,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield
} from 'react-icons/fi'
import { HiOutlineCamera } from 'react-icons/hi'
import { useAuth } from '../../contexts/AuthContext'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { logout } = useAuth()

  const navItems = [
    { icon: FiHome, label: 'Dashboard', path: '/admin' },
    { icon: FiCheckCircle, label: 'Verifications', path: '/admin/verifications' },
    { icon: FiUsers, label: 'Users', path: '/admin/users' },
    { icon: FiDollarSign, label: 'Subscriptions', path: '/admin/subscriptions' },
    { icon: FiBarChart, label: 'Analytics', path: '/admin/analytics' },
    { icon: FiSettings, label: 'Settings', path: '/admin/settings' },
  ]

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
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white shadow-lg transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <Link to="/admin" className="flex items-center space-x-2">
            <HiOutlineCamera className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-bold">Klick n Shoot</span>
            <FiShield className="w-5 h-5 text-blue-400" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
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
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
            className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-900 hover:text-white rounded-lg transition-colors mt-8"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>

        {/* Admin Badge */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <FiShield className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-gray-400">Full access</p>
            </div>
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
              
              <h1 className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 font-medium"
              >
                Back to Site
              </Link>
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

export default AdminLayout