import { Link } from 'react-router-dom'
import { FiMapPin, FiStar, FiCheckCircle, FiCamera, FiVideo } from 'react-icons/fi'
import { formatCurrency } from '../../utils/formatters'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'

const CreativeCard = ({ creative }) => {
  const {
    _id,
    displayName,
    location,
    services = [],
    rating,
    verification,
    portfolio = [],
    stats = {}
  } = creative

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const hasPhotos = portfolio.some(item => item.mediaType === 'image')
  const hasVideos = portfolio.some(item => item.mediaType === 'video')

  return (
    <Link to={`/creatives/${_id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100">
        {/* Creative Header */}
        <div className="p-6 border-b">
          <div className="flex items-start space-x-4">
            <Avatar 
              initials={getInitials(displayName)}
              size="large"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{displayName}</h3>
                {verification?.isVerified && (
                  <Badge variant="success" size="small">
                    <FiCheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              {/* Location */}
              {location && (location.county || location.city) && (
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <FiMapPin className="w-4 h-4 mr-1" />
                  {[location.city, location.county].filter(Boolean).join(', ')}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">{rating?.average?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-500 text-sm ml-1">
                    ({rating?.count || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Stats */}
        <div className="p-6">
          {/* Services */}
          {services.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
              <div className="flex flex-wrap gap-2">
                {services.slice(0, 3).map((service, index) => (
                  <Badge key={index} variant="primary" size="small">
                    {service}
                  </Badge>
                ))}
                {services.length > 3 && (
                  <span className="text-sm text-gray-500">
                    +{services.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Portfolio Info */}
          <div className="flex items-center text-sm text-gray-600 mb-4">
            {hasPhotos && (
              <span className="flex items-center mr-4">
                <FiCamera className="w-4 h-4 mr-1" />
                Photos
              </span>
            )}
            {hasVideos && (
              <span className="flex items-center">
                <FiVideo className="w-4 h-4 mr-1" />
                Videos
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {stats.completedProjects || 0}
              </p>
              <p className="text-sm text-gray-600">Projects</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {stats.acceptedProposals || 0}
              </p>
              <p className="text-sm text-gray-600">Hired</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            View Profile
          </button>
        </div>
      </div>
    </Link>
  )
}

export default CreativeCard