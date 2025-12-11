import { useState, useEffect } from 'react'
import { FiFilter, FiSearch, FiMapPin, FiStar, FiCheckCircle } from 'react-icons/fi'
import CreativeCard from '../../components/marketplace/CreativeCard'
import InputField from '../../components/forms/InputField'
import SelectField from '../../components/forms/SelectField'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { creativeService } from '../../services/creative.service'
import { KENYA_COUNTIES, SERVICES } from '../../utils/constants'

const BrowseCreatives = () => {
  const [creatives, setCreatives] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    county: '',
    city: '',
    services: [],
    minRating: 0,
    verified: false
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  })

  useEffect(() => {
    fetchCreatives()
  }, [filters, pagination.page])

  const fetchCreatives = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key] || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key]
        }
      })

      const response = await creativeService.getCreatives(params)
      setCreatives(response.creatives)
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }))
    } catch (error) {
      console.error('Error fetching creatives:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleServiceToggle = (service) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      county: '',
      city: '',
      services: [],
      minRating: 0,
      verified: false
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
    if (filters.services.length > 0) count++
    if (filters.minRating > 0) count++
    if (filters.verified) count++
    return count
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Browse Verified Creatives</h1>
          <p className="text-xl text-blue-100">
            Find the perfect photographer or videographer for your project
          </p>
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
              placeholder="Search by name, skills, or location..."
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

              {/* Services Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Services</h3>
                <div className="space-y-2">
                  {SERVICES.map(service => (
                    <label key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700 capitalize">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FiStar className="w-4 h-4 mr-2" />
                  Minimum Rating
                </h3>
                <div className="flex items-center space-x-2">
                  {[0, 3, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('minRating', rating)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filters.minRating === rating
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification Filter */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => handleFilterChange('verified', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 flex items-center">
                    <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Verified Creatives Only
                  </span>
                </label>
              </div>

              <Button
                onClick={fetchCreatives}
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
                  {pagination.total} Creatives Found
                </h2>
                {getActiveFilterCount() > 0 && (
                  <p className="text-gray-600 mt-1">
                    Showing results with applied filters
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && creatives.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : creatives.length === 0 ? (
              <EmptyState
                icon="search"
                title="No creatives found"
                message="Try adjusting your filters or search term"
                action={
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="mt-4"
                  >
                    Clear all filters
                  </Button>
                }
              />
            ) : (
              <>
                {/* Creatives Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creatives.map(creative => (
                    <CreativeCard key={creative._id} creative={creative} />
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
                        // Show first page, last page, current page, and pages around current page
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

export default BrowseCreatives