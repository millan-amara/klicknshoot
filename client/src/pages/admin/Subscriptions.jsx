import { useState, useEffect } from 'react'
import { FiDollarSign, FiCalendar, FiCheckCircle, FiXCircle, FiTrendingUp, FiUsers } from 'react-icons/fi'
import { adminService } from '../../services/admin.service'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Card from '../../components/common/Card'
import StatsCard from '../../components/dashboard/StatsCard'

const AdminSubscriptions = () => {
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState([])
  const [stats, setStats] = useState(null)
  const [timeframe, setTimeframe] = useState('month')

  useEffect(() => {
    fetchSubscriptions()
    fetchSubscriptionStats()
  }, [timeframe])

  const fetchSubscriptions = async () => {
    try {
      const response = await adminService.getSubscriptions({ timeframe })
      setSubscriptions(response.subscriptions || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  const fetchSubscriptionStats = async () => {
    try {
      const response = await adminService.getSubscriptionStats({ timeframe })
      setStats(response)
    } catch (error) {
      console.error('Error fetching subscription stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      pending: 'bg-blue-100 text-blue-800'
    }
    
    const icons = {
      active: FiCheckCircle,
      cancelled: FiXCircle,
      expired: FiXCircle,
      pending: FiCalendar
    }
    
    const Icon = icons[status]
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full flex items-center ${colors[status]}`}>
        <Icon className="mr-1" size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPlanBadge = (plan) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-green-100 text-green-800',
      pro: 'bg-indigo-100 text-indigo-800'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[plan]}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    )
  }

  const formatCurrency = (amount) => {
    return `KES ${amount?.toLocaleString() || 0}`
  }

  if (loading && !stats) {
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
          <h1 className="text-3xl font-bold text-gray-900">Subscription Analytics</h1>
          <p className="text-gray-600 mt-2">
            Monitor subscription revenue and user upgrades
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue)}
          icon={FiDollarSign}
          change={stats?.revenueGrowth}
          changeType={stats?.revenueGrowth >= 0 ? 'up' : 'down'}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          icon={FiUsers}
          change={stats?.subscriptionGrowth}
          changeType={stats?.subscriptionGrowth >= 0 ? 'up' : 'down'}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          icon={FiTrendingUp}
          change={stats?.conversionGrowth}
          changeType={stats?.conversionGrowth >= 0 ? 'up' : 'down'}
        />
        <StatsCard
          title="Churn Rate"
          value={`${stats?.churnRate || 0}%`}
          icon={FiXCircle}
          change={stats?.churnChange}
          changeType={stats?.churnChange <= 0 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscription List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Subscriptions</h2>
              <span className="text-sm text-gray-600">
                {subscriptions.length} total subscriptions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.slice(0, 10).map((subscription) => (
                    <tr key={subscription._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-8 w-8">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={subscription.user?.profilePicture || `https://ui-avatars.com/api/?name=${subscription.user?.firstName || ''}+${subscription.user?.lastName || ''}`}
                              alt=""
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {subscription.user?.firstName} {subscription.user?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subscription.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(subscription.plan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(subscription.payment?.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(subscription.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscription.endDate ? (
                          new Date(subscription.endDate).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {subscriptions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiDollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscriptions found</h3>
                <p className="text-gray-600">No subscription data for the selected timeframe</p>
              </div>
            )}
          </Card>
        </div>

        {/* Plan Distribution & Metrics */}
        <div className="space-y-8">
          {/* Plan Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h2>
            {stats?.planDistribution ? (
              <div className="space-y-4">
                {Object.entries(stats.planDistribution).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        plan === 'pro' ? 'bg-indigo-500' :
                        plan === 'basic' ? 'bg-green-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-700">
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-500">
                        {stats.totalSubscriptions > 0 
                          ? `${Math.round((count / stats.totalSubscriptions) * 100)}%`
                          : '0%'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No distribution data</p>
            )}
          </Card>

          {/* Revenue Metrics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">MRR</span>
                <span className="font-semibold">{formatCurrency(stats?.mrr)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ARR</span>
                <span className="font-semibold">{formatCurrency(stats?.arr)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Revenue/User</span>
                <span className="font-semibold">{formatCurrency(stats?.arpa)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lifetime Value</span>
                <span className="font-semibold">{formatCurrency(stats?.ltv)}</span>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Upgrades This Month</span>
                <span className="font-medium text-green-600">+{stats?.upgrades || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Downgrades This Month</span>
                <span className="font-medium text-red-600">-{stats?.downgrades || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cancellations This Month</span>
                <span className="font-medium text-red-600">-{stats?.cancellations || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Renewal Rate</span>
                <span className="font-medium">{stats?.renewalRate || 0}%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminSubscriptions