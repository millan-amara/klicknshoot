import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'up',
  className = '',
  loading = false
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {changeType === 'up' ? (
            <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}% from last month
          </span>
        </div>
      )}
    </div>
  )
}

export default StatsCard