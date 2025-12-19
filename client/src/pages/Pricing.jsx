import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiCheck, 
  FiX, 
  FiUsers, 
  FiDollarSign, 
  FiEye,
  FiStar,
  FiMessageCircle,
  FiShield
} from 'react-icons/fi'
import Button from '../components/common/Button'
import { subscriptionService } from '../services/subscription.service'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../utils/formatters'

const Pricing = () => {
  const [plans, setPlans] = useState(null)
  const [loading, setLoading] = useState(true)
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const response = await subscriptionService.getPlans()
      setPlans(response.plans)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPrice = (plan) => {
    if (!plan) return 0
    if (billingPeriod === 'yearly') {
      return plan.price * 12 * 0.8 // 20% discount for yearly
    }
    return plan.price
  }

  const getBillingText = () => {
    return billingPeriod === 'yearly' ? 'per year' : 'per month'
  }

  const features = [
    { key: 'proposalsPerMonth', label: 'Proposals per month', icon: FiMessageCircle },
    { key: 'activeRequests', label: 'Active requests', icon: FiUsers },
    { key: 'canSeeBudget', label: 'See client budgets', icon: FiEye },
    { key: 'priority', label: 'Search priority', icon: FiStar },
    { key: 'verificationBadge', label: 'Verification badge', icon: FiShield }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include core features with no hidden fees.
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center">
            <span className="mr-4 text-blue-200">Monthly</span>
            <button
              onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-white"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-blue-600 transition ${
                billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="ml-4 text-blue-200">Yearly</span>
            {billingPeriod === 'yearly' && (
              <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(plans || {}).map(([planKey, plan]) => {
            const isCurrentPlan = isAuthenticated && user?.subscription === planKey
            const isPopular = planKey === 'basic'
            
            return (
              <div
                key={planKey}
                className={`relative rounded-2xl shadow-lg overflow-hidden ${
                  isPopular ? 'border-2 border-blue-500 transform md:scale-105' : 'border border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="bg-white p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Free' : formatCurrency(getPrice(plan))}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600 ml-2">{getBillingText()}</span>
                      )}
                    </div>
                    {plan.price > 0 && billingPeriod === 'yearly' && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatCurrency(plan.price * 12)} billed yearly
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {features.map(feature => {
                      const value = plan.limits[feature.key]
                      const Icon = feature.icon
                      
                      return (
                        <div key={feature.key} className="flex items-center">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <FiCheck className="w-5 h-5 text-green-500 mr-3" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-300 mr-3" />
                            )
                          ) : (
                            <Icon className="w-5 h-5 text-blue-500 mr-3" />
                          )}
                          
                          <div className="flex-1">
                            <span className="text-gray-700">{feature.label}</span>
                            {typeof value !== 'boolean' && (
                              <span className="ml-2 font-semibold text-gray-900">
                                {typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : value}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Additional Features */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-3">Also includes:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isCurrentPlan ? (
                      <div className="text-center">
                        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                          Your Current Plan
                        </div>
                        {planKey !== 'pro' && (
                          <Link to={`/checkout/${planKey === 'free' ? 'basic' : 'pro'}`} className="block mt-3">
                            <Button variant="outline" className="w-full">
                              Upgrade Plan
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <Link to={isAuthenticated ? `/checkout/${planKey}` : `/register?plan=${planKey}`}>
                        <Button
                          variant={isPopular ? 'primary' : 'outline'}
                          className={isPopular ? 'primary text-white w-full' : 'outline w-full'}
                          size="large"
                        >
                          {planKey === 'free' ? 'Get Started Free' : 'Choose Plan'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How do proposals work?</h3>
              <p className="text-gray-600">
                Each request can receive up to 5 proposals. As a creative, you can submit proposals to requests that match your skills. 
                Clients review proposals and choose the best fit.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens after a proposal is accepted?</h3>
              <p className="text-gray-600">
                Once a client accepts your proposal, they'll receive your WhatsApp contact information to discuss project details. 
                Klick n Shoot doesn't handle payments - you arrange payment directly with the client.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade at any time. When upgrading, you'll get immediate access to new features. 
                When downgrading, changes take effect at the end of your billing period.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a free trial for paid plans?</h3>
              <p className="text-gray-600">
                We don't offer free trials, but you can start with our free plan to test the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="outline" size="large">
                Contact Support
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" className='text-white' size="large">
                Start Free Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing