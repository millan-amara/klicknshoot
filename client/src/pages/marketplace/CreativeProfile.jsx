import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  FiMapPin, 
  FiStar, 
  FiCheckCircle, 
  FiCamera, 
  FiVideo,
  FiMail,
  FiPhone,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiGlobe,
  FiMessageCircle
} from 'react-icons/fi'
import { creativeService } from '../../services/creative.service'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/common/Button'
import PortfolioGallery from '../../components/marketplace/PortfolioGallery'
import RatingStars from '../../components/marketplace/RatingStars'
import WhatsAppButton from '../../components/marketplace/WhatsAppButton'
import { formatCurrency } from '../../utils/formatters'

const CreativeProfile = () => {
  const { id } = useParams()
  const [creative, setCreative] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('portfolio')

  useEffect(() => {
    fetchCreative()
  }, [id])

  const fetchCreative = async () => {
    setLoading(true)
    try {
      const response = await creativeService.getCreativeById(id)
      setCreative(response.creative)
    } catch (error) {
      console.error('Error fetching creative:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'instagram': return FiInstagram
      case 'twitter': return FiTwitter
      case 'facebook': return FiFacebook
      case 'youtube': return FiYoutube
      case 'portfolio': return FiGlobe
      default: return FiGlobe
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!creative) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Creative not found</h2>
          <p className="text-gray-600 mb-6">The creative profile you're looking for doesn't exist.</p>
          <Link to="/creatives">
            <Button variant="primary">Browse Creatives</Button>
          </Link>
        </div>
      </div>
    )
  }

  const {
    displayName,
    bio,
    location,
    services = [],
    equipment = [],
    socialLinks = {},
    verification,
    rating,
    portfolio = [],
    stats = {}
  } = creative

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                {displayName?.charAt(0) || 'C'}
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  {verification?.isVerified && (
                    <Badge variant="success" className="flex items-center">
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center mb-3">
                  <RatingStars rating={rating?.average || 0} size="large" />
                  <span className="ml-2 text-blue-100">
                    ({rating?.count || 0} reviews)
                  </span>
                </div>

                {/* Location */}
                {location && (location.county || location.city) && (
                  <div className="flex items-center text-blue-100">
                    <FiMapPin className="w-4 h-4 mr-2" />
                    {[location.city, location.county].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3">
              <WhatsAppButton
                phoneNumber={creative.phoneNumber}
                message={`Hello ${displayName}, I saw your profile on FrameFinder and I'm interested in working with you.`}
                className="bg-green-600 hover:bg-green-700"
              >
                <FiMessageCircle className="w-4 h-4 mr-2" />
                Contact on WhatsApp
              </WhatsAppButton>
              
              <Link to={`/requests?creative=${id}`}>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  View Available Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['portfolio', 'about', 'reviews'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        py-4 px-6 font-medium text-sm border-b-2 transition-colors capitalize
                        ${activeTab === tab
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'portfolio' && (
                  <PortfolioGallery items={portfolio} />
                )}

                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {bio && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                        <p className="text-gray-700 whitespace-pre-line">{bio}</p>
                      </div>
                    )}

                    {services.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Services</h3>
                        <div className="flex flex-wrap gap-2">
                          {services.map(service => (
                            <Badge key={service} variant="primary">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {equipment.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Equipment</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {equipment.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
                        <div className="flex items-center mt-2">
                          <RatingStars rating={rating?.average || 0} />
                          <span className="ml-2 text-gray-600">
                            Based on {rating?.count || 0} reviews
                          </span>
                        </div>
                      </div>
                    </div>

                    {rating?.count === 0 ? (
                      <p className="text-gray-500 text-center py-8">No reviews yet</p>
                    ) : (
                      <div className="space-y-6">
                        {/* Reviews would go here */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 italic">
                            Reviews feature coming soon...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-1/3">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects Completed</span>
                  <span className="font-semibold">{stats.completedProjects || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Acceptance Rate</span>
                  <span className="font-semibold">
                    {stats.totalProposals ? 
                      `${Math.round((stats.acceptedProposals || 0) / stats.totalProposals * 100)}%` 
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">Usually within 24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold">{creative.metadata?.profileViews || 0}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {Object.entries(socialLinks).some(([_, url]) => url) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                <div className="space-y-3">
                  {Object.entries(socialLinks)
                    .filter(([_, url]) => url)
                    .map(([platform, url]) => {
                      const Icon = getSocialIcon(platform)
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Icon className="w-5 h-5 text-gray-600 mr-3" />
                          <span className="font-medium text-gray-700 capitalize">
                            {platform === 'portfolio' ? 'Portfolio Website' : platform}
                          </span>
                        </a>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <FiMail className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{creative.user?.email}</span>
                </div>
                {creative.phoneNumber && (
                  <div className="flex items-center text-gray-700">
                    <FiPhone className="w-5 h-5 text-gray-400 mr-3" />
                    <span>{creative.phoneNumber}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  Member since {new Date(creative.createdAt).toLocaleDateString()}
                </p>
                <WhatsAppButton
                  phoneNumber={creative.phoneNumber}
                  message={`Hello ${displayName}, I saw your profile on FrameFinder and I'm interested in working with you.`}
                  className="w-full justify-center"
                >
                  <FiMessageCircle className="w-4 h-4 mr-2" />
                  Start Conversation
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreativeProfile