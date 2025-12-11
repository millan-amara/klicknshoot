import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FiCheck, FiCreditCard, FiShield, FiX } from 'react-icons/fi'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const Checkout = () => {
  const { plan } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createSubscription, loading: subscriptionLoading } = useSubscription()
  const [processing, setProcessing] = useState(false)

  const plans = {
    free: {
      name: 'Free',
      price: 0,
      monthlyPrice: 0,
      features: [
        '10 proposals per month',
        '3 active requests',
        'Basic support',
        'Standard search ranking'
      ],
      limitations: [
        'Cannot view client budgets',
        'Lower priority in search results'
      ]
    },
    basic: {
      name: 'Basic',
      price: 500,
      monthlyPrice: 500,
      features: [
        '50 proposals per month',
        '10 active requests',
        'View client budgets',
        'Priority support',
        'Medium search ranking',
        'Verification badge included'
      ],
      popular: false
    },
    pro: {
      name: 'Pro',
      price: 1500,
      monthlyPrice: 1500,
      features: [
        'Unlimited proposals',
        '30 active requests',
        'View client budgets',
        '24/7 priority support',
        'Highest search ranking',
        'Verification badge included',
        'Portfolio showcase',
        'Analytics dashboard'
      ],
      popular: true
    }
  }

  useEffect(() => {
    if (!plans[plan]) {
      toast.error('Invalid plan selected')
      navigate('/pricing')
    }
  }, [plan, navigate])

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to continue')
      navigate('/login', { state: { from: `/checkout/${plan}` } })
      return
    }

    setProcessing(true)
    try {
      const response = await createSubscription({
        plan: plan,
        period: 'monthly'
      })

      if (response.paymentUrl) {
        // Redirect to Paystack payment page
        window.location.href = response.paymentUrl
      } else if (response.success) {
        toast.success('Subscription activated successfully!')
        navigate('/dashboard/creative')
      }
    } catch (error) {
      toast.error(error.message || 'Payment processing failed')
      console.error('Payment error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const currentPlan = plans[plan]

  if (!currentPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Complete Your Subscription
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            You're about to upgrade to the <span className="font-semibold text-indigo-600">{currentPlan.name}</span> plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Details Card */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name} Plan</h2>
                    <p className="text-gray-600 mt-1">Monthly subscription</p>
                  </div>
                  {currentPlan.popular && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">KES {currentPlan.price}</span>
                    <span className="ml-2 text-gray-600">/ month</span>
                  </div>
                  <p className="text-gray-500 mt-2">Billed monthly, cancel anytime</p>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                  <ul className="space-y-3">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FiCheck className="w-5 h-5 text-green-500 mt-0.5 mr-3 shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations for Free plan */}
                {currentPlan.limitations && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Limitations</h3>
                    <ul className="space-y-3">
                      {currentPlan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <FiX className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
                          <span className="text-gray-700">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Payment Summary Card */}
          <div>
            <Card className="sticky top-24">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium">{currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing Period</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">KES {currentPlan.price}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>KES {currentPlan.price}</span>
                    </div>
                  </div>
                </div>

                {/* Security & Payment Info */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiShield className="w-4 h-4 mr-2" />
                    <span>Secure payment powered by Paystack</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCreditCard className="w-4 h-4 mr-2" />
                    <span>All major cards & mobile money accepted</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handlePayment}
                    loading={processing || subscriptionLoading}
                    disabled={processing || subscriptionLoading}
                    className="w-full"
                    size="large"
                  >
                    {processing || subscriptionLoading ? 'Processing...' : `Pay KES ${currentPlan.price}`}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/pricing')}
                    variant="outline"
                    className="w-full"
                  >
                    Change Plan
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">
                    By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                    Your subscription will auto-renew unless cancelled.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout