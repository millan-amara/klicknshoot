import { FiCheckCircle, FiXCircle } from 'react-icons/fi'
import ProgressBar from '../ui/ProgressBar'

const ProfileCompletion = ({ items = [], className = '' }) => {
  const completedItems = items.filter(item => item.completed).length
  const totalItems = items.length
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
        <span className="text-2xl font-bold text-blue-600">
          {completionPercentage.toFixed(0)}%
        </span>
      </div>

      <ProgressBar
        value={completedItems}
        max={totalItems}
        showLabel={false}
        size="medium"
        color="blue"
        className="mb-6"
      />

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              {item.completed ? (
                <FiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
              ) : (
                <FiXCircle className="w-5 h-5 text-gray-300 mr-3" />
              )}
              <span className={item.completed ? 'text-gray-900' : 'text-gray-500'}>
                {item.label}
              </span>
            </div>
            {!item.completed && item.action && (
              <button
                onClick={item.action}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Complete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileCompletion