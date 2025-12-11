import { FiDollarSign, FiEye, FiEyeOff } from 'react-icons/fi'
import { formatCurrency } from '../../utils/formatters'
import { useSubscription } from '../../contexts/SubscriptionContext'

const BudgetDisplay = ({ budget, className = '' }) => {
  const { canSeeBudget } = useSubscription()

  if (!budget) return null

  if (!canSeeBudget) {
    return (
      <div className={`flex items-center text-gray-600 ${className}`}>
        <FiEyeOff className="w-4 h-4 mr-2" />
        <span className="font-medium">Budget hidden</span>
        <span className="text-sm text-gray-500 ml-2">
          (Upgrade to see budget)
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* <FiDollarSign className="w-4 h-4 mr-2 text-gray-600" /> */}
      <div>
        <span className="font-medium text-gray-900">Budget:</span>
        <span className="ml-2 text-lg font-semibold text-blue-600">
          {formatCurrency(budget.min)} - {formatCurrency(budget.max)}
        </span>
      </div>
    </div>
  )
}

export default BudgetDisplay