import { useState, useEffect } from 'react'
import { 
  FiSearch, 
  FiFilter, 
  FiCheckCircle, 
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiMessageCircle
} from 'react-icons/fi'
import ProposalCard from '../../../components/marketplace/ProposalCard'
import Button from '../../../components/common/Button'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import { creativeService } from '../../../services/creative.service'
import { proposalService } from '../../../services/proposal.service'
import { useAuth } from '../../../contexts/AuthContext'
import { useUser } from '../../../contexts/UserContext'
import { formatCurrency } from '../../../utils/formatters'

const CreativeProposals = () => {
  const { user } = useAuth()
  const { profile } = useUser()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'metadata.submittedAt',
    sortOrder: '-1'
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })

  useEffect(() => {
    fetchProposals()
  }, [filters, pagination.page])

  const fetchProposals = async () => {
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

      const response = await creativeService.getCreativeProposals(profile?._id, params)
      setProposals(response.proposals)
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }))
    } catch (error) {
      console.error('Error fetching proposals:', error)
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
      sortBy: 'metadata.submittedAt',
      sortOrder: '-1'
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleWithdrawProposal = async (proposalId) => {
    if (window.confirm('Are you sure you want to withdraw this proposal? This action cannot be undone.')) {
      try {
        await proposalService.withdrawProposal(proposalId)
        fetchProposals() // Refresh list
      } catch (error) {
        console.error('Error withdrawing proposal:', error)
      }
    }
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status) count++
    return count
  }

  const getStatusStats = () => {
    const stats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
      total: 0
    }
    
    proposals.forEach(proposal => {
      stats[proposal.status] = (stats[proposal.status] || 0) + 1
      stats.total++
    })
    
    return stats
  }

  const stats = getStatusStats()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
        <p className="text-gray-600 mt-2">
          Track and manage your submitted proposals
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.withdrawn}</div>
          <div className="text-sm text-gray-600">Withdrawn</div>
        </div>
      </div>

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
              placeholder="Search proposals by request title..."
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
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
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
                  <option value="metadata.submittedAt">Date Submitted</option>
                  <option value="quote.amount">Quote Amount</option>
                  <option value="request.title">Request Title</option>
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
      ) : proposals.length === 0 ? (
        <EmptyState
          icon="folder"
          title="No proposals found"
          message={getActiveFilterCount() > 0 
            ? "Try adjusting your filters"
            : "Submit your first proposal to get hired"
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
            </div>
          }
        />
      ) : (
        <>
          {/* Proposals List */}
          <div className="space-y-6">
            {proposals.map(proposal => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                onWithdraw={handleWithdrawProposal}
                showActions={proposal.status === 'pending'}
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

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Proposal Tips</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Increasing Acceptance Rate</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Read the request carefully before submitting</li>
              <li>• Personalize your proposal message</li>
              <li>• Provide a clear price breakdown</li>
              <li>• Include relevant portfolio links</li>
              <li>• Be clear about your availability</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">After Acceptance</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Respond to WhatsApp messages within 24 hours</li>
              <li>• Confirm project details in writing</li>
              <li>• Discuss payment terms upfront</li>
              <li>• Deliver work on time</li>
              <li>• Ask for reviews after project completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  // Helper function for pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export default CreativeProposals