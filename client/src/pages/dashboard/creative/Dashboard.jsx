import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiBriefcase, 
  FiCheckCircle, 
  FiDollarSign, 
  FiTrendingUp,
  FiCalendar,
  FiMessageSquare,
  FiAlertCircle
} from 'react-icons/fi'
import StatsCard from '../../../components/dashboard/StatsCard'
import QuickActions from '../../../components/dashboard/QuickActions'
import ActivityFeed from '../../../components/dashboard/ActivityFeed'
import SubscriptionStatus from '../../../components/dashboard/SubscriptionStatus'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import Button from '../../../components/common/Button'
import { creativeService } from '../../../services/creative.service'
import { proposalService } from '../../../services/proposal.service'
import { userService } from '../../../services/user.service'
import { useAuth } from '../../../contexts/AuthContext'
import { useUser } from '../../../contexts/UserContext'

const CreativeDashboard = () => {
  const { user } = useAuth()
  const { profile, profileLoading } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentProposals, setRecentProposals] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    // Only fetch dashboard data when profile is loaded AND user exists
    if (user && profile && !profileLoading) {
      console.log('✅ Profile loaded, fetching dashboard data')
      fetchDashboardData()
    }
  }, [user, profile, profileLoading])

  const fetchDashboardData = async () => {
    console.log('USER ID:', user.id)
    console.log('PROFILE ID:', profile?._id);
    setLoading(true)
    try {
      // Fetch stats
      const statsResponse = await userService.getUserStats(user.id)
      setStats(statsResponse.stats) 

      // Fetch recent proposals
      const proposalsResponse = await creativeService.getCreativeProposals(profile?._id, {
        page: 1,
        limit: 5
      })
      setRecentProposals(proposalsResponse.proposals)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      icon: FiBriefcase,
      title: 'Browse Jobs',
      description: 'Find new photography & videography opportunities',
      path: '/requests'
    },
    {
      icon: FiCheckCircle,
      title: 'Submit for Verification',
      description: 'Get verified to attract more clients',
      path: '/dashboard/creative/profile'
    },
    {
      icon: FiMessageSquare,
      title: 'My Proposals',
      description: 'View and manage your submitted proposals',
      path: '/dashboard/creative/proposals'
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
          Welcome back, {profile?.firstName || 'Creative'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your creative business today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} />

          {/* Recent Proposals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Proposals</h2>
              <Link to="/dashboard/creative/proposals">
                <Button variant="outline" size="small">
                  View All
                </Button>
              </Link>
            </div>

            {recentProposals.length === 0 ? (
              <EmptyState
                icon="folder"
                title="No proposals yet"
                message="Start browsing requests and submit your first proposal"
                action={
                  <Link to="/requests">
                    <Button variant="outline">Browse Jobs</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {recentProposals.slice(0, 3).map((proposal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {proposal.request?.title || 'Unknown Request'}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">
                          {proposal.quote ? `KES ${proposal.quote.amount}` : 'No quote'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(proposal.metadata?.submittedAt).toLocaleDateString()}
                      </p>
                      {proposal.status === 'accepted' && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          ✓ Contact client
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

          {/* Subscription Status */}
          <SubscriptionStatus />

          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h2>
            
            {profile?.verification?.isVerified ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Verified ✓</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your profile is verified and appears higher in search results.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Not Verified</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get verified to build trust with clients and appear higher in search results.
                </p>
                <Link to="/dashboard/creative/profile">
                  <Button variant="primary" className="w-full text-white">
                    Submit for Verification
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Add at least 5 portfolio items to increase credibility</li>
              <li>• Respond to proposals within 24 hours</li>
              <li>• Update your availability calendar regularly</li>
              <li>• Ask satisfied clients for reviews</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreativeDashboard