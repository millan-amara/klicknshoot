import { useState, useEffect } from 'react'
import { 
  FiTrendingUp, 
  FiUsers, 
  FiBriefcase, 
  FiMessageSquare,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiPieChart
} from 'react-icons/fi'
import { adminService } from '../../services/admin.service'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Card from '../../components/common/Card'
import StatsCard from '../../components/dashboard/StatsCard'
import Button from '../../components/common/Button'

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [timeframe, setTimeframe] = useState('month')

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await adminService.getAnalytics({ timeframe })
      setAnalytics(response)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getTopCategories = () => {
    if (!analytics?.requestCategories) return []
    
    return Object.entries(analytics.requestCategories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  const getTopLocations = () => {
    if (!analytics?.topLocations) return []
    
    return analytics.topLocations.slice(0, 5)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into platform performance and user behavior
          </p>
        </div>
        
        <div className="flex space-x-2">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm rounded-full ${
                timeframe === period
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={formatNumber(analytics?.totalUsers || 0)}
          icon={FiUsers}
          change={analytics?.userGrowth || 0}
          changeType="up"
        />
        <StatsCard
          title="Active Requests"
          value={formatNumber(analytics?.activeRequests || 0)}
          icon={FiBriefcase}
          change={analytics?.requestGrowth || 0}
          changeType="up"
        />
        <StatsCard
          title="Proposals Submitted"
          value={formatNumber(analytics?.totalProposals || 0)}
          icon={FiMessageSquare}
          change={analytics?.proposalGrowth || 0}
          changeType="up"
        />
        <StatsCard
          title="Acceptance Rate"
          value={`${analytics?.acceptanceRate || 0}%`}
          icon={FiTrendingUp}
          change={analytics?.acceptanceGrowth || 0}
          changeType="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Performance */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Platform Performance</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analytics?.avgResponseTime || 0}h</div>
                <div className="text-sm text-gray-600">Avg. Response Time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analytics?.completionRate || 0}%</div>
                <div className="text-sm text-gray-600">Project Completion</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analytics?.userRetention || 0}%</div>
                <div className="text-sm text-gray-600">User Retention</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analytics?.avgSessionDuration || 0}m</div>
                <div className="text-sm text-gray-600">Avg. Session</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analytics?.bounceRate || 0}%</div>
                <div className="text-sm text-gray-600">Bounce Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analytics?.pagesPerSession || 0}</div>
                <div className="text-sm text-gray-600">Pages/Session</div>
              </div>
            </div>
          </Card>

          {/* Top Categories */}
          <Card className="p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Top Request Categories</h2>
              <FiPieChart className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {getTopCategories().map(([category, count], index) => (
                <div key={category} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                      <span className="text-sm text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${(count / (analytics?.totalRequests || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Geographic Distribution */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Top Locations</h2>
              <FiMapPin className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {getTopLocations().map((location, index) => (
                <div key={location._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-gray-700">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{location.county}</div>
                      <div className="text-xs text-gray-600">{location.city}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{location.count}</div>
                    <div className="text-xs text-gray-600">requests</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* User Activity */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Active Users</span>
                <span className="font-semibold">{analytics?.dailyActiveUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly Active Users</span>
                <span className="font-semibold">{analytics?.weeklyActiveUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Active Users</span>
                <span className="font-semibold">{analytics?.monthlyActiveUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Signups</span>
                <span className="font-semibold text-green-600">+{analytics?.newSignups || 0}</span>
              </div>
            </div>
          </Card>

          {/* Conversion Funnel */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
            <div className="space-y-3">
              {[
                { label: 'Visitors', value: analytics?.funnel?.visitors || 0 },
                { label: 'Signups', value: analytics?.funnel?.signups || 0 },
                { label: 'Active Users', value: analytics?.funnel?.activeUsers || 0 },
                { label: 'Paying Users', value: analytics?.funnel?.payingUsers || 0 }
              ].map((step, index) => (
                <div key={step.label} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{step.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatNumber(step.value)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(step.value / (analytics?.funnel?.visitors || 1)) * 100}%`
                      }}
                    />
                  </div>
                  {index < 3 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Export & Actions */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            // Export analytics data
            adminService.exportAnalytics({ timeframe })
          }}
          variant="outline"
        >
          Export Data
        </Button>
      </div>
    </div>
  )
}

export default AdminAnalytics