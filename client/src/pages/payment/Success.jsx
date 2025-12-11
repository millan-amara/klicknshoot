import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiMail, FiDownload } from 'react-icons/fi'
import { useSubscription } from '../../contexts/SubscriptionContext'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyPayment } = useSubscription()
  
  const reference = searchParams.get('reference')
  const plan = searchParams.get('plan') || 'basic'

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      if (reference) {
        try {
          await verifyPayment(reference)
        } catch (error) {
          console.error('Payment verification failed:', error)
        }
      }
    }

    verifyPaymentStatus()
  }, [reference, verifyPayment])

  const getPlanDetails = (planName) => {
    const plans = {
      basic: { name: 'Basic', features: ['50 proposals/month', 'View budgets', 'Priority support'] },
      pro: { name: 'Pro', features: ['Unlimited proposals', 'Highest ranking', '24/7 support'] }
    }
    return plans[plan] || plans.basic
  }

  const planDetails = getPlanDetails(plan)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
            <FiCheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Payment Successful!
          </h2>
          
          <p className="text-gray-600 mb-2">
            Thank you for subscribing to the
          </p>
          <p className="text-xl font-semibold text-indigo-600 mb-6">
            {planDetails.name} Plan
          </p>

          {/* Reference Number */}
          {reference && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Transaction Reference</p>
              <p className="font-mono text-sm font-medium text-gray-900">{reference}</p>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <FiMail className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                <span>You'll receive a confirmation email with your receipt</span>
              </li>
              <li>• Your subscription is now active with immediate access</li>
              <li>• You can start using all {planDetails.name} plan features</li>
              <li>• Your subscription will auto-renew monthly</li>
            </ul>
          </div>

          {/* Features Summary */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-3">Your new features:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link to="/dashboard/creative">
              <Button className="w-full" size="large">
                Go to Dashboard
              </Button>
            </Link>

            <div className="flex gap-3">
              <Link to="/requests" className="flex-1">
                <Button variant="outline" className="w-full">
                  Browse Jobs
                </Button>
              </Link>
              
              <Button variant="outline" className="flex-1">
                <div className="flex items-center justify-center">
                  <FiDownload className="mr-2" />
                  Receipt
                </div>
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Need help?{' '}
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
                Contact our support team
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PaymentSuccess