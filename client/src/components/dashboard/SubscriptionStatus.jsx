import { Link } from 'react-router-dom'
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi'
import { useSubscription } from '../../contexts/SubscriptionContext'
import Button from '../common/Button'

const SubscriptionStatus = ({ className = '' }) => {
  const { subscription, limits, canSubmitProposal, getRemainingProposals } = useSubscription()

  if (!subscription && !limits) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading subscription info...</p>
        </div>
      </div>
    )
  }

  const planName = subscription?.plan || 'free'
  const isActive = subscription?.status === 'active'
  const planColor = planName === 'pro' ? 'purple' : planName === 'basic' ? 'blue' : 'gray'

  const features = [
    {
      label: 'Proposals per month',
      value: limits?.proposalsPerMonth || 0,
      current: getRemainingProposals(),
      icon: FiCheck,
      available: canSubmitProposal()
    },
    {
      label: 'See client budgets',
      value: limits?.canSeeBudget ? 'Yes' : 'No',
      icon: limits?.canSeeBudget ? FiCheck : FiX
    },
    {
      label: 'Priority placement',
      value: limits?.priority || 'low',
      icon: FiCheck
    },
    {
      label: 'Verification badge',
      value: limits?.verificationBadge ? 'Yes' : 'No',
      icon: limits?.verificationBadge ? FiCheck : FiX
    }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Plan</h3>
          <div className="flex items-center mt-2">
            <span className={`text-2xl font-bold text-${planColor}-600 capitalize`}>
              {planName}
            </span>
            {isActive ? (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Active
              </span>
            ) : (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                Inactive
              </span>
            )}
          </div>
        </div>
        
        {planName === 'free' && (
          <Link to="/pricing">
            <Button variant="primary" size="small">
              Upgrade
            </Button>
          </Link>
        )}
      </div>

      {/* Proposal Usage */}
      {features[0] && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {features[0].label}
            </span>
            <span className="text-sm text-gray-600">
              {features[0].current} of {features[0].value} remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((features[0].value - features[0].current) / features[0].value) * 100}%` }}
            ></div>
          </div>
          {!features[0].available && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <FiAlertCircle className="w-4 h-4 mr-1" />
              Upgrade to submit more proposals
            </p>
          )}
        </div>
      )}

      {/* Features List */}
      <div className="space-y-3">
        {features.slice(1).map((feature, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <feature.icon className={`w-5 h-5 mr-3 ${
                feature.value === 'Yes' || feature.value === 'high' || feature.value === 'medium'
                  ? 'text-green-500' 
                  : 'text-gray-300'
              }`} />
              <span className="text-gray-700">{feature.label}</span>
            </div>
            <span className="font-medium text-gray-900 capitalize">{feature.value}</span>
          </div>
        ))}
      </div>

      {planName !== 'free' && subscription?.endDate && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600">
            Your plan renews on {new Date(subscription.endDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default SubscriptionStatus