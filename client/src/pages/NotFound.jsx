import { Link } from 'react-router-dom'
import { FiCamera, FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi'
import Button from '../components/common/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <FiCamera className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-xl text-gray-600">
            Oops! The page you're looking for seems to have wandered off into the creative wilderness.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-12">
          <div className="relative w-64 h-64 mx-auto">
            <div className="absolute inset-0 bg-blue-100 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-6xl">📷</div>
            </div>
            <div className="absolute top-4 right-4 text-4xl">🔍</div>
            <div className="absolute bottom-4 left-4 text-4xl">💡</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/">
            <Button variant="primary" size="large" leftIcon={<FiHome />}>
              Back to Home
            </Button>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/creatives"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiSearch className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="font-medium text-gray-900">Find Creatives</p>
            </Link>
            
            <Link
              to="/requests"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💼</span>
                </div>
              </div>
              <p className="font-medium text-gray-900">Browse Jobs</p>
            </Link>
            
            <Link
              to="/pricing"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
              </div>
              <p className="font-medium text-gray-900">View Pricing</p>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8">
          <p className="text-gray-600">
            Still lost?{' '}
            <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact our support team
            </Link>{' '}
            for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound