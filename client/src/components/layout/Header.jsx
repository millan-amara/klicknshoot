import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiSearch, FiUser, FiBell } from 'react-icons/fi'
import { HiOutlineCamera } from 'react-icons/hi'
import { useAuth } from '../../contexts/AuthContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  // const handleLogout = () => {
  //   logout()
  //   navigate('/')
  //   setIsProfileMenuOpen(false)
  // }
  const handleLogout = () => {
    setIsProfileMenuOpen(false)
    navigate('/')   // instant redirect
    logout().catch(console.error) // async cleanup but not blocking
  }

  const navLinks = [
    { name: 'Find Creatives', path: '/creatives' },
    { name: 'Browse Jobs', path: '/requests' },
    { name: 'How it Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
  ]

  const userDashboardLink = user?.role === 'creative' 
    ? '/dashboard/creative' 
    : '/dashboard/client'

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <HiOutlineCamera className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Klick n Shoot</span>
            <span className="text-sm font-semibold text-blue-600">Kenya</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/search')}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  aria-label="Search"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => navigate('/notifications')}
                  className="p-2 text-gray-600 hover:text-blue-600 relative"
                  aria-label="Notifications"
                >
                  <FiBell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.email?.split('@')[0]}
                      {user?.firstName}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2">
                      <Link
                        to={userDashboardLink}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to={`/${user?.role}/profile`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <div className="border-t my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 font-medium hover:text-blue-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 lg:hidden text-gray-700 hover:text-blue-600"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to={userDashboardLink}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/notifications"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Notifications
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-left text-red-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-blue-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header