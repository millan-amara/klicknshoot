import { useState } from 'react'
import { FiMessageSquare, FiCheck, FiX, FiClock, FiDollarSign } from 'react-icons/fi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import Badge from '../ui/Badge'
import Button from '../common/Button'

const ProposalCard = ({ proposal, onAccept, onReject, onWithdraw, showActions = false }) => {
  const [showDetails, setShowDetails] = useState(false)

  const {
    _id,
    message,
    quote,
    timeline,
    status,
    clientViewed,
    metadata,
    creative
  } = proposal

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'accepted': return 'success'
      case 'rejected': return 'danger'
      case 'withdrawn': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review'
      case 'accepted': return 'Accepted'
      case 'rejected': return 'Rejected'
      case 'withdrawn': return 'Withdrawn'
      default: return status
    }
  }

  const truncateMessage = (text) => {
    if (text.length <= 150) return text
    return text.substring(0, 150) + '...'
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100">
      {/* Proposal Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getStatusColor(status)} size="small">
                {getStatusText(status)}
              </Badge>
              {clientViewed && status === 'pending' && (
                <Badge variant="info" size="small">
                  Viewed
                </Badge>
              )}
            </div>
            
            {/* Creative Info */}
            {creative && (
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="font-semibold text-blue-600">
                    {creative.displayName?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{creative.displayName}</h4>
                  {creative.verification?.isVerified && (
                    <span className="text-sm text-green-600">✓ Verified</span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Quote */}
          {quote && (
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Quoted Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(quote.amount)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Proposal Body */}
      <div className="p-6">
        {/* Message */}
        <div className="mb-4">
          <h5 className="font-medium text-gray-700 mb-2">Message:</h5>
          <p className="text-gray-600">
            {showDetails ? message : truncateMessage(message)}
            {message.length > 150 && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {showDetails ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        </div>

        {/* Timeline */}
        {timeline && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-700 mb-2 flex items-center">
              <FiClock className="w-4 h-4 mr-2" />
              Timeline
            </h5>
            <div className="bg-gray-50 rounded-lg p-3">
              {timeline.startDate && timeline.endDate ? (
                <p className="text-gray-600">
                  {formatDate(timeline.startDate)} - {formatDate(timeline.endDate)}
                </p>
              ) : timeline.duration ? (
                <p className="text-gray-600">{timeline.duration}</p>
              ) : null}
            </div>
          </div>
        )}

        {/* Quote Breakdown */}
        {quote?.breakdown && quote.breakdown.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-700 mb-2 flex items-center">
              <FiDollarSign className="w-4 h-4 mr-2" />
              Price Breakdown
            </h5>
            <div className="bg-gray-50 rounded-lg p-3">
              {quote.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span className="text-gray-600">{item.item}</span>
                  <span className="font-medium">{formatCurrency(item.cost)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(quote.amount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submitted Date */}
        {metadata?.submittedAt && (
          <p className="text-sm text-gray-500">
            Submitted on {formatDate(metadata.submittedAt)}
          </p>
        )}
      </div>

      {/* Actions */}
      {showActions && status === 'pending' && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="success"
                size="small"
                onClick={() => onAccept(_id)}
                leftIcon={<FiCheck />}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={() => onReject(_id)}
                leftIcon={<FiX />}
              >
                Reject
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="small"
              onClick={() => onWithdraw(_id)}
            >
              Withdraw
            </Button>
          </div>
        </div>
      )}

      {/* Accepted Actions */}
      {status === 'accepted' && (
        <div className="px-6 py-4 bg-green-50 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium mb-1">
                ✓ Proposal Accepted
              </p>
              <p className="text-sm text-green-600">
                Contact the creative to proceed with the project
              </p>
            </div>
            <Button
              variant="success"
              onClick={() => {/* Open WhatsApp */}}
            >
              Contact on WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProposalCard