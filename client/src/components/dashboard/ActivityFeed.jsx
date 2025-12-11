import { FiCheckCircle, FiFileText, FiMessageSquare, FiUserPlus, FiDollarSign } from 'react-icons/fi'
import { formatDateTime } from '../../utils/formatters'

const ActivityFeed = ({ activities = [], className = '' }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'proposal': return FiFileText
      case 'message': return FiMessageSquare
      case 'connection': return FiUserPlus
      case 'payment': return FiDollarSign
      case 'completion': return FiCheckCircle
      default: return FiFileText
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'proposal': return 'text-blue-600 bg-blue-50'
      case 'message': return 'text-green-600 bg-green-50'
      case 'connection': return 'text-purple-600 bg-purple-50'
      case 'payment': return 'text-yellow-600 bg-yellow-50'
      case 'completion': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDateTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ActivityFeed