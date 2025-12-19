import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiBriefcase, 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp,
  FiCalendar,
  FiMessageSquare,
  FiPlus
} from 'react-icons/fi'
import StatsCard from '../../../components/dashboard/StatsCard'
import QuickActions from '../../../components/dashboard/QuickActions'
import ActivityFeed from '../../../components/dashboard/ActivityFeed'
import SubscriptionStatus from '../../../components/dashboard/SubscriptionStatus'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import Button from '../../../components/common/Button'
import { clientService } from '../../../services/client.service'
import { requestService } from '../../../services/request.service'
import { useAuth } from '../../../contexts/AuthContext'
import { useUser } from '../../../contexts/UserContext'
import { formatCurrency } from '../../../utils/formatters'

const ClientDashboard = () => {
  const { user } = useAuth()
  const { profile } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentRequests, setRecentRequests] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch client stats
      const statsResponse = await clientService.getClientStats(profile?._id)
      setStats(statsResponse.stats)

      // Fetch recent requests
      const requestsResponse = await clientService.getClientRequests(profile?._id, {
        page: 1,
        limit: 5
      })
      setRecentRequests(requestsResponse.requests)

      // Mock activities (in real app, fetch from API)
      const mockActivities = [
        {
          type: 'proposal',
          message: 'You received a new proposal for "Wedding Photography"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          type: 'message',
          message: 'Creative accepted your proposal for "Product Shoot"',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
        },
        {
          type: 'completion',
          message: 'Your request for "Corporate Event" has been completed',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'payment',
          message: 'KES 25,000 paid to creative for "Real Estate Photography"',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ]
      setActivities(mockActivities)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      icon: FiPlus,
      title: 'Post a Request',
      description: 'Find creatives for your project',
      path: '/dashboard/client/requests/new'
    },
    {
      icon: FiBriefcase,
      title: 'My Requests',
      description: 'View and manage your posted requests',
      path: '/dashboard/client/requests'
    },
    {
      icon: FiUsers,
      title: 'Browse Creatives',
      description: 'Find photographers & videographers',
      path: '/creatives'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.firstName || 'Client'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your projects and find the perfect creative for your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} />

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
              <div className="flex space-x-3">
                <Link to="/dashboard/client/requests">
                  <Button variant="outline" size="small">
                    View All
                  </Button>
                </Link>
                <Link to="/dashboard/client/requests/new">
                  <Button variant="primary" className='text-white' size="small" lefticon={<FiPlus />}>
                    New Request
                  </Button>
                </Link>
              </div>
            </div>

            {recentRequests.length === 0 ? (
              <EmptyState
                icon="folder"
                title="No requests yet"
                message="Post your first request to find creatives for your project"
                action={
                  <Link to="/dashboard/client/requests/new">
                    <Button variant="primary" className='text-white'>Post a Request</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {recentRequests.slice(0, 3).map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{request.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'open' ? 'bg-green-100 text-green-800' :
                          request.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">
                          {request.proposalCount} proposals
                        </span>
                        {request.budget && (
                          <span className="ml-3 text-sm text-gray-600">
                            {formatCurrency(request.budget.min)} - {formatCurrency(request.budget.max)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      {request.status === 'open' && request.proposalCount > 0 && (
                        <p className="text-sm text-blue-600 font-medium mt-1">
                          View proposals →
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">

          {/* Tips for Clients */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Tips for Better Results</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Be specific about your budget range</li>
              <li>• Include clear project requirements</li>
              <li>• Review creative portfolios before accepting proposals</li>
              <li>• Respond to proposals within 48 hours</li>
              <li>• Leave reviews for completed projects</li>
            </ul>
          </div>

          {/* Support Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our support team is here to help you find the perfect creative.
            </p>
            <Link to="/contact">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard