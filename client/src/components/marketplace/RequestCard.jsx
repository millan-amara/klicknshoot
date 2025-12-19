import { Link } from 'react-router-dom'
import { FiMapPin, FiCalendar, FiClock, FiDollarSign, FiEye } from 'react-icons/fi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import Badge from '../ui/Badge'
import { useEffect } from 'react'

const RequestCard = ({ request, showBudget = true }) => {
  const {
    _id,
    title,
    description,
    category,
    serviceType,
    budget,
    location,
    date,
    status,
    proposalCount,
    metadata = {}
  } = request

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success'
      case 'reviewing': return 'warning'
      case 'closed': return 'danger'
      default: return 'default'
    }
  }

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case 'photography': return '📷'
      case 'videography': return '🎥'
      case 'both': return '📹'
      default: return '🎯'
    }
  }

  useEffect(() => {
    console.log(request)
  }, [request])

  return (
    <Link to={`/requests/${_id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100">
        {/* Card Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getStatusColor(status)} size="small">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                <Badge variant="info" size="small">
                  {getServiceTypeIcon(serviceType)} {serviceType}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Budget */}
          {showBudget && budget && (
            <div className="mb-4">
              <div className="flex items-center text-gray-700 mb-1">
                <span className="font-medium">Budget:</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(budget.min)} - {formatCurrency(budget.max)}
              </p>
            </div>
          )}

          {/* Location & Date */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {location && (location.county || location.city) && (
              <div>
                <div className="flex items-center text-gray-700 mb-1">
                  <FiMapPin className="w-4 h-4 mr-2" />
                  <span className="font-medium">Location:</span>
                </div>
                <p className="text-gray-900">
                  {[location.city, location.county].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            
            {date && (
              <div>
                <div className="flex items-center text-gray-700 mb-1">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">Date:</span>
                </div>
                <p className="text-gray-900">{formatDate(date)}</p>
              </div>
            )}
          </div>

          {/* Category & Proposals */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <Badge variant="default" size="small">
                {category}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FiEye className="w-4 h-4 mr-1" />
                <span>{metadata.views || 0} views</span>
              </div>
              <div>
                <span>{proposalCount || 0}/5 proposals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              View Details
            </button>
            {proposalCount < 5 && status === 'open' && (
              <span className="text-sm text-green-600 font-medium">
                Accepting proposals
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default RequestCard