// // Create a new file: /src/pages/subscription/Callback.js
// import { useEffect } from 'react'
// import { useSearchParams, useNavigate } from 'react-router-dom'
// import { toast } from 'react-hot-toast'
// import LoadingSpinner from '../../components/common/LoadingSpinner'
// import { subscriptionService } from '../../services/subscription.service'

// const PaystackCallback = () => {
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const reference = searchParams.get('reference')
//   const trxref = searchParams.get('trxref')

//   useEffect(() => {
//     const verifyPayment = async () => {
//       try {
//         if (!reference && !trxref) {
//           throw new Error('No payment reference found')
//         }

//         // Verify payment with backend
//         const response = await subscriptionService.verifyPayment({
//           reference: reference || trxref
//         })

//         if (response.success) {
//           toast.success('Payment successful! Subscription activated.')
//           navigate('/dashboard/creative')
//         } else {
//           toast.error('Payment verification failed')
//           navigate('/pricing')
//         }
//       } catch (error) {
//         console.error('Payment verification error:', error)
//         toast.error(error.message || 'Payment verification failed')
//         navigate('/pricing')
//       }
//     }

//     verifyPayment()
//   }, [reference, trxref, navigate])

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="text-center">
//         <LoadingSpinner size="large" />
//         <p className="mt-4 text-gray-600">Verifying your payment...</p>
//       </div>
//     </div>
//   )
// }

// export default PaystackCallback

// Callback.jsx - SIMPLIFIED VERSION
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'

const PaystackCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Verifying your payment...')
  
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const successParam = searchParams.get('success')

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // If Paystack redirects with success=false
        if (successParam === 'false') {
          setStatus('failed')
          setMessage('Payment was not successful. Please try again.')
          
          setTimeout(() => {
            navigate('/pricing')
          }, 3000)
          return
        }

        // If we have a reference, we can show a success message
        // Webhook will handle the actual verification in background
        if (reference) {
          setStatus('success')
          setMessage('Payment received! Activating your subscription...')
          
          // Wait a moment for webhook to process, then redirect
          setTimeout(() => {
            navigate('/dashboard/creative')
          }, 2000)
        } else {
          // No reference found
          setStatus('failed')
          setMessage('No payment reference found')
          
          setTimeout(() => {
            navigate('/pricing')
          }, 3000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        setStatus('failed')
        setMessage('An error occurred while processing your payment')
        
        setTimeout(() => {
          navigate('/pricing')
        }, 3000)
      }
    }

    checkPaymentStatus()
  }, [reference, successParam, navigate])

  const renderIcon = () => {
    switch (status) {
      case 'success':
        return <FiCheckCircle className="h-12 w-12 text-green-500" />
      case 'failed':
        return <FiAlertCircle className="h-12 w-12 text-red-500" />
      default:
        return <FiClock className="h-12 w-12 text-blue-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-6">
            {renderIcon()}
          </div>
          
          <h2 className={`text-3xl font-bold ${getStatusColor()} mb-4`}>
            {status === 'success' ? 'Payment Successful!' : 
             status === 'failed' ? 'Payment Failed' : 
             'Processing Payment...'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {reference && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-1">Reference Number</p>
              <p className="font-mono text-sm font-medium text-gray-900 break-all">
                {reference}
              </p>
            </div>
          )}
          
          <div className="mt-8">
            {status === 'processing' && (
              <div className="text-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-sm text-gray-500">
                  Please wait while we confirm your payment...
                </p>
              </div>
            )}
            
            {status === 'failed' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You will be redirected to the pricing page shortly.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Pricing
                </button>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Redirecting you to your dashboard...
                </p>
                <button
                  onClick={() => navigate('/dashboard/creative')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Go to Dashboard Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaystackCallback