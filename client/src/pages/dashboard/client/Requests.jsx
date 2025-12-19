import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEye,
  FiMessageSquare,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from 'react-icons/fi'
import RequestCard from '../../../components/marketplace/RequestCard'
import Button from '../../../components/common/Button'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import { requestService } from '../../../services/request.service'
import { useAuth } from '../../../contexts/AuthContext'
import { useUser } from '../../../contexts/UserContext'
import { useSubscription } from '../../../contexts/SubscriptionContext'

const ClientRequests = () => {
  const { user } = useAuth()
  const { profile } = useUser()
  const { limits } = useSubscription()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: '-1'
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  })

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
      status: '',
      sortBy: 'createdAt',
      sortOrder: '-1'
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
    if (filters.status) count++
    return count
  }

  const handleCloseRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to close this request? This will stop receiving new proposals.')) {
      try {
        await requestService.closeRequest(requestId)
        fetchRequests() // Refresh list
      } catch (error) {
        console.error('Error closing request:', error)
      }
    }
  }

  const handleReopenRequest = async (requestId) => {
    try {
      await requestService.reopenRequest(requestId)
      fetchRequests() // Refresh list
    } catch (error) {
      console.error('Error reopening request:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return FiClock
      case 'reviewing': return FiEye
      case 'closed': return FiCheckCircle
      case 'cancelled': return FiXCircle
      default: return FiClock
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-50'
      case 'reviewing': return 'text-yellow-600 bg-yellow-50'
      case 'closed': return 'text-blue-600 bg-blue-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage your photography and videography requests
          </p> 
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link to="/dashboard/client/requests/new">
            <Button variant="primary" leftIcon={<FiPlus />} className='text-white'>
              New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Request Limits */}
      {limits && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 font-medium">
                Request Limits: {requests.filter(r => r.status === 'open' || r.status === 'reviewing').length} / {limits.activeRequests} active
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Upgrade your plan to post more requests simultaneously
              </p>
            </div>
            {requests.filter(r => r.status === 'open' || r.status === 'reviewing').length >= limits.activeRequests && (
              <Link to="/pricing">
                <Button variant="primary" size="small">
                  Upgrade Plan
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search your requests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="reviewing">Reviewing</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FiFilter />}
            >
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="proposalCount">Proposal Count</option>
                  <option value="budget.min">Budget (Low to High)</option>
                  <option value="-budget.min">Budget (High to Low)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="-1">Newest First</option>
                  <option value="1">Oldest First</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon="folder"
          title="No requests found"
          message={getActiveFilterCount() > 0 
            ? "Try adjusting your filters"
            : "Post your first request to find creatives for your project"
          }
          action={
            <div className="flex space-x-3">
              {getActiveFilterCount() > 0 && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
              <Link to="/dashboard/client/requests/new">
                <Button variant="primary">
                  Post Your First Request
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <>
          {/* Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map(request => {
              const StatusIcon = getStatusIcon(request.status)
              return (
                <div key={request._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                  <div className="p-6">
                    {/* Request Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            <StatusIcon className="w-4 h-4 inline-block mr-1" />
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Proposals</p>
                        <p className="font-medium">{request.proposalCount}/5</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="font-medium">
                          KES {request.budget?.min?.toLocaleString()} - {request.budget?.max?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium capitalize">{request.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{new Date(request.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-2">
                        <Link to={`/requests/${request._id}`}>
                          <Button variant="outline" size="small">
                            View Details
                          </Button>
                        </Link>
                        
                        {request.proposalCount > 0 && (
                          <Link to={`/dashboard/client/requests/${request._id}/proposals`}>
                            <Button variant="primary" size="small" leftIcon={<FiMessageSquare />}>
                              View Proposals ({request.proposalCount})
                            </Button>
                          </Link>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {request.status === 'open' && (
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleCloseRequest(request._id)}
                          >
                            Close
                          </Button>
                        )}
                        
                        {request.status === 'closed' && (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleReopenRequest(request._id)}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
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
  )
}

export default ClientRequests