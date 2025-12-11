import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiFilter, FiSearch, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi'
import RequestCard from '../../components/marketplace/RequestCard'
import InputField from '../../components/forms/InputField'
import SelectField from '../../components/forms/SelectField'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { requestService } from '../../services/request.service'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { KENYA_COUNTIES, CATEGORIES, SERVICE_TYPES } from '../../utils/constants'

const BrowseRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    county: '',
    city: '',
    category: '',
    serviceType: '',
    minBudget: '',
    maxBudget: '',
    status: 'open'
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  })

  const { canSeeBudget } = useSubscription()

  useEffect(() => {
    fetchRequests()
  }, [filters, pagination.page])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key]
        }
      })

      const response = await requestService.getRequests(params)
      setRequests(response.requests)
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }))
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      county: '',
      city: '',
      category: '',
      serviceType: '',
      minBudget: '',
      maxBudget: '',
      status: 'open'
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.county) count++
    if (filters.city) count++
    if (filters.category) count++
    if (filters.serviceType) count++
    if (filters.minBudget) count++
    if (filters.maxBudget) count++
    return count
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">Find Photography & Videography Jobs</h1>
              <p className="text-xl text-blue-100">
                Browse requests from clients looking for your creative skills
              </p>
            </div>
            <Link to="/dashboard/client/requests/new" className="mt-6 md:mt-0">
              <Button size="large" className="bg-white text-blue-600 hover:bg-blue-50">
                + Post a Request
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title, description, or keywords..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <div className="flex items-center space-x-2">
                  {getActiveFilterCount() > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                      {getActiveFilterCount()} active
                    </span>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Location Filters */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FiMapPin className="w-4 h-4 mr-2" />
                  Location
                </h3>
                <SelectField
                  value={filters.county}
                  onChange={(e) => handleFilterChange('county', e.target.value)}
                  options={['', ...KENYA_COUNTIES].map(county => ({ 
                    value: county, 
                    label: county || 'All Counties' 
                  }))}
                  className="mb-3"
                />
                <InputField
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Enter city..."
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Category</h3>
                <SelectField
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  options={['', ...CATEGORIES].map(category => ({ 
                    value: category, 
                    label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ') 
                  }))}
                />
              </div>

              {/* Service Type Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Service Type</h3>
                <SelectField
                  value={filters.serviceType}
                  onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                  options={SERVICE_TYPES.map(service => ({ 
                    value: service.value, 
                    label: service.label 
                  }))}
                />
              </div>

              {/* Budget Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FiDollarSign className="w-4 h-4 mr-2" />
                  Budget Range (KES)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    type="number"
                    value={filters.minBudget}
                    onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                    placeholder="Min"
                  />
                  <InputField
                    type="number"
                    value={filters.maxBudget}
                    onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  Status
                </h3>
                <div className="flex items-center space-x-4">
                  {['open', 'reviewing', 'closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange('status', status)}
                      className={`px-3 py-1 rounded-full text-sm capitalize ${
                        filters.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={fetchRequests}
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full"
                leftIcon={<FiFilter />}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {getActiveFilterCount() > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {pagination.total} Requests Found
                </h2>
                {getActiveFilterCount() > 0 && (
                  <p className="text-gray-600 mt-1">
                    Showing {filters.status} requests with applied filters
                  </p>
                )}
                {!canSeeBudget && (
                  <p className="text-sm text-yellow-600 mt-2">
                    ⚠️ Upgrade your subscription to see client budgets
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="border rounded-lg px-3 py-1 text-sm">
                  <option>Newest</option>
                  <option>Budget (High to Low)</option>
                  <option>Budget (Low to High)</option>
                  <option>Proposals (Fewest)</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && requests.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : requests.length === 0 ? (
              <EmptyState
                icon="search"
                title={`No ${filters.status} requests found`}
                message="Try adjusting your filters or check back later"
                action={
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="mt-4"
                    >
                      Clear all filters
                    </Button>
                    <Link to="/dashboard/client/requests/new">
                      <Button variant="primary" className="mt-4">
                        Post a Request
                      </Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <>
                {/* Requests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {requests.map(request => (
                    <RequestCard 
                      key={request._id} 
                      request={request} 
                      showBudget={canSeeBudget}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center mt-12">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNumber = index + 1
                        if (
                          pageNumber === 1 ||
                          pageNumber === pagination.totalPages ||
                          (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-3 py-2 border rounded-lg ${
                                pagination.page === pageNumber
                                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          )
                        } else if (
                          pageNumber === 2 && pagination.page > 3 ||
                          pageNumber === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2
                        ) {
                          return <span key={pageNumber} className="px-2">...</span>
                        }
                        return null
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrowseRequests