import { useState, useEffect } from 'react'
import { 
  FiUsers, 
  FiDollarSign, 
  FiBriefcase, 
  FiCheckCircle,
  FiTrendingUp,
  FiActivity,
  FiCalendar
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { adminService } from '../../services/admin.service'
import StatsCard from '../../components/dashboard/StatsCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const statsResponse = await adminService.getDashboardStats()
      setStats(statsResponse)

      const activityResponse = await adminService.getRecentActivity()
      setRecentActivity(activityResponse.activities || [])
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickStats = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      change: stats?.userGrowth || 0,
      changeType: 'up',
      color: 'blue'
    },
    {
      title: 'Total Revenue',
      value: `KES ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      change: stats?.revenueGrowth || 0,
      changeType: 'up',
      color: 'green'
    },
    {
      title: 'Active Requests',
      value: stats?.activeRequests || 0,
      icon: FiBriefcase,
      change: stats?.requestGrowth || 0,
      changeType: 'up',
      color: 'purple'
    },
    {
      title: 'Pending Verifications',
      value: stats?.pendingVerifications || 0,
      icon: FiCheckCircle,
      change: stats?.verificationRate || 0,
      changeType: 'down',
      color: 'yellow'
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.firstName}. Here's an overview of your platform.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/verifications">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                  <FiCheckCircle className="w-8 h-8 mb-2" />
                  <span>Review Verifications</span>
                </Button>
              </Link>
              
              <Link to="/admin/users">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                  <FiUsers className="w-8 h-8 mb-2" />
                  <span>Manage Users</span>
                </Button>
              </Link>
              
              <Link to="/admin/subscriptions">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                  <FiDollarSign className="w-8 h-8 mb-2" />
                  <span>Subscriptions</span>
                </Button>
              </Link>
              
              <Link to="/admin/analytics">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                  <FiActivity className="w-8 h-8 mb-2" />
                  <span>Analytics</span>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link to="/admin/analytics">
                <Button variant="outline" size="small">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      activity.type === 'signup' ? 'bg-blue-100' :
                      activity.type === 'payment' ? 'bg-green-100' :
                      activity.type === 'verification' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'signup' && <FiUsers className="text-blue-600" />}
                      {activity.type === 'payment' && <FiDollarSign className="text-green-600" />}
                      {activity.type === 'verification' && <FiCheckCircle className="text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-600">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - System Status */}
        <div className="space-y-8">
          {/* Platform Health */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">API Status</span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Database</span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Paystack Gateway</span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Uptime</span>
                <span className="font-medium">99.8%</span>
              </div>
            </div>
          </Card>

          {/* Recent Registrations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
              <FiTrendingUp className="text-green-500" />
            </div>
            <div className="space-y-3">
              {stats?.recentRegistrations?.map((registration, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{registration.email}</p>
                    <p className="text-xs text-gray-600">{registration.role}</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(registration.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Insights */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Response Time</span>
                <span className="font-medium">2.4 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-medium">18.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Churn Rate</span>
                <span className="font-medium">3.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ARPU</span>
                <span className="font-medium">KES 850</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard