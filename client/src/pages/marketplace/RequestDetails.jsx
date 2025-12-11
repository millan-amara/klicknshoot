import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiClock,
  FiUser,
  FiCheckCircle,
  FiMessageCircle,
  FiAlertCircle
} from 'react-icons/fi'
import { requestService } from '../../services/request.service'
import { proposalService } from '../../services/proposal.service'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import InputField from '../../components/forms/InputField'
import TextareaField from '../../components/forms/TextareaField'
import BudgetDisplay from '../../components/marketplace/BudgetDisplay'
import { formatCurrency, formatDate } from '../../utils/formatters'

const RequestDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { canSubmitProposal, getRemainingProposals } = useSubscription()
  
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [submittingProposal, setSubmittingProposal] = useState(false)
  const [proposalError, setProposalError] = useState('')
  
  // Proposal form
  const [proposalData, setProposalData] = useState({
    message: '',
    quoteAmount: '',
    timeline: ''
  })

  useEffect(() => {
    fetchRequest()
  }, [id])

  const fetchRequest = async () => {
    setLoading(true)
    try {
      const response = await requestService.getRequestById(id)
      setRequest(response.request)
    } catch (error) {
      console.error('Error fetching request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProposalSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/requests/${id}` } })
      return
    }

    if (!canSubmitProposal()) {
      setProposalError(`You've reached your proposal limit. Upgrade your subscription to submit more proposals.`)
      return
    }

    setSubmittingProposal(true)
    setProposalError('')

    try {
      const proposal = {
        request: id,
        message: proposalData.message,
        quote: {
          amount: parseInt(proposalData.quoteAmount),
          currency: 'KES'
        },
        timeline: proposalData.timeline ? {
          duration: proposalData.timeline
        } : undefined
      }

      const response = await proposalService.submitProposal(proposal)
      if (response.success) {
        setShowProposalModal(false)
        setProposalData({ message: '', quoteAmount: '', timeline: '' })
        // Refresh request to update proposal count
        fetchRequest()
        navigate('/dashboard/creative/proposals')
      }
    } catch (error) {
      setProposalError(error.message || 'Failed to submit proposal')
    } finally {
      setSubmittingProposal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request not found</h2>
          <p className="text-gray-600 mb-6">The request you're looking for doesn't exist or has been removed.</p>
          <Link to="/requests">
            <Button variant="primary">Browse Requests</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isCreative = user?.role === 'creative'
  const isClient = user?.role === 'client'
  const isRequestOwner = isClient && user?.id === request.client?._id
  const canSubmit = isCreative && request.status === 'open' && request.proposalCount < 5

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Request Details */}
          <div className="lg:w-2/3">
            {/* Back Button */}
            <div className="mb-6">
              <Link to="/requests" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                ← Back to all requests
              </Link>
            </div>

            {/* Request Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'open' ? 'bg-green-100 text-green-800' :
                      request.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {request.serviceType}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{request.title}</h1>
                </div>
                
                {isRequestOwner && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="small">
                      Edit
                    </Button>
                    <Button variant="danger" size="small">
                      Close
                    </Button>
                  </div>
                )}
              </div>

              {/* Budget */}
              <div className="mb-6">
                <BudgetDisplay budget={request.budget} />
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">{request.description}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Location */}
                {request.location && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      Location
                    </h4>
                    <p className="text-gray-900">
                      {request.location.city && `${request.location.city}, `}
                      {request.location.county}
                      {request.location.exactLocation && (
                        <span className="block text-sm text-gray-600 mt-1">
                          {request.location.exactLocation}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Date */}
                {request.date && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      Date
                    </h4>
                    <p className="text-gray-900">{formatDate(request.date)}</p>
                  </div>
                )}

                {/* Duration */}
                {request.duration && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FiClock className="w-4 h-4 mr-2" />
                      Duration
                    </h4>
                    <p className="text-gray-900">
                      {request.duration.value} {request.duration.unit}
                    </p>
                  </div>
                )}

                {/* Category */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Category</h4>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {request.category}
                  </span>
                </div>
              </div>

              {/* Requirements */}
              {request.requirements && request.requirements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {request.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Client Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FiUser className="w-5 h-5 mr-2" />
                  Posted by
                </h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <FiUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.client?.displayName}</p>
                    {request.client?.company?.name && (
                      <p className="text-sm text-gray-600">{request.client.company.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Proposals Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposals</h3>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{request.proposalCount}</div>
                    <div className="text-sm text-gray-600">Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{5 - request.proposalCount}</div>
                    <div className="text-sm text-gray-600">Remaining slots</div>
                  </div>
                </div>

                {isRequestOwner && request.proposalCount > 0 && (
                  <Link to={`/dashboard/client/requests/${id}/proposals`}>
                    <Button variant="primary">View Proposals</Button>
                  </Link>
                )}
              </div>

              {request.status !== 'open' && (
                <div className={`p-4 rounded-lg ${
                  request.status === 'closed' ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
                }`}>
                  <p className="flex items-center">
                    {request.status === 'closed' ? (
                      <FiCheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 mr-2" />
                    )}
                    This request is {request.status} and {request.status === 'closed' ? 'no longer' : 'not'} accepting proposals.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Action Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-8">
              {/* Action Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit a Proposal</h3>
                
                {!isAuthenticated ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Sign in to submit a proposal</p>
                    <Link to="/login" state={{ from: `/requests/${id}` }}>
                      <Button variant="primary" className="w-full mb-3">
                        Sign In
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-500">
                      Don't have an account?{' '}
                      <Link to="/register?role=creative" className="text-blue-600 hover:text-blue-700">
                        Join as Creative
                      </Link>
                    </p>
                  </div>
                ) : !isCreative ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Only creatives can submit proposals</p>
                    <Link to="/register?role=creative">
                      <Button variant="outline" className="w-full">
                        Switch to Creative Account
                      </Button>
                    </Link>
                  </div>
                ) : !canSubmit ? (
                  <div className="text-center">
                    {request.status !== 'open' ? (
                      <p className="text-gray-600 mb-4">This request is not accepting proposals</p>
                    ) : request.proposalCount >= 5 ? (
                      <p className="text-gray-600 mb-4">This request has reached the maximum number of proposals</p>
                    ) : null}
                    <Link to="/requests">
                      <Button variant="outline" className="w-full">
                        Browse Other Requests
                      </Button>
                    </Link>
                  </div>
                ) : !canSubmitProposal() ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      You have {getRemainingProposals()} proposals remaining this month
                    </p>
                    <Link to="/pricing">
                      <Button variant="primary" className="w-full">
                        Upgrade to Submit More
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Submit your proposal for this request. You have {getRemainingProposals()} proposals left this month.
                    </p>
                    <Button
                      variant="primary"
                      className="w-full mb-3"
                      onClick={() => setShowProposalModal(true)}
                    >
                      Submit Proposal
                    </Button>
                    <p className="text-xs text-gray-500">
                      Max 5 proposals per request • WhatsApp contact upon acceptance
                    </p>
                  </div>
                )}
              </div>

              {/* Request Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${
                      request.status === 'open' ? 'text-green-600' :
                      request.status === 'reviewing' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proposals</span>
                    <span className="font-medium">{request.proposalCount}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{request.metadata?.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-medium">{formatDate(request.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires</span>
                    <span className="font-medium">{formatDate(request.expiresAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Submission Modal */}
      <Modal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        title="Submit Proposal"
        size="medium"
      >
        <form onSubmit={handleProposalSubmit}>
          {proposalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {proposalError}
            </div>
          )}

          <TextareaField
            label="Your Proposal Message"
            value={proposalData.message}
            onChange={(e) => setProposalData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Introduce yourself and explain why you're the best fit for this project..."
            rows={6}
            required
            helperText="Explain your approach, experience, and why you're perfect for this job"
            className="mb-6"
          />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <InputField
              label="Your Quote (KES)"
              type="number"
              value={proposalData.quoteAmount}
              onChange={(e) => setProposalData(prev => ({ ...prev, quoteAmount: e.target.value }))}
              placeholder="5000"
              required
              leftIcon={<FiDollarSign className="text-gray-400" />}
              helperText="Total amount for the project"
            />
            <InputField
              label="Timeline"
              value={proposalData.timeline}
              onChange={(e) => setProposalData(prev => ({ ...prev, timeline: e.target.value }))}
              placeholder="2 days, 1 week, etc."
              leftIcon={<FiClock className="text-gray-400" />}
              helperText="Estimated time to complete"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If your proposal is accepted, the client will contact you via WhatsApp using the phone number in your profile.
              Make sure your profile information is up to date.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowProposalModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submittingProposal}
            >
              Submit Proposal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default RequestDetails