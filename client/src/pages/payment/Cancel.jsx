import { Link } from 'react-router-dom'
import { FiXCircle, FiArrowLeft } from 'react-icons/fi'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="text-center">
          {/* Cancel Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-6">
            <FiXCircle className="h-8 w-8 text-red-600" />
          </div>

          {/* Cancel Message */}
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Payment Cancelled
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your payment was not completed. No charges have been made to your account.
          </p>

          {/* Reasons & Solutions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">What could have happened?</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• You cancelled the payment intentionally</li>
              <li>• Payment authorization timed out</li>
              <li>• Insufficient funds in your account</li>
              <li>• Technical issue with the payment gateway</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-3">You can still:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Try the payment again with a different method</li>
              <li>• Contact your bank if there were authorization issues</li>
              <li>• Continue using the free plan features</li>
              <li>• Contact support if you need help</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link to="/pricing">
              <Button className="w-full" size="large">
                Choose a Different Plan
              </Button>
            </Link>

            <div className="flex gap-3">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <div className="flex items-center justify-center">
                    <FiArrowLeft className="mr-2" />
                    Back to Home
                  </div>
                </Button>
              </Link>
              
              <Link to="/contact" className="flex-1">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Need immediate assistance?{' '}
              <a href="mailto:support@Klick n Shoot.co.ke" className="text-indigo-600 hover:text-indigo-500">
                Email us at support@Klick n Shoot.co.ke
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PaymentCancel