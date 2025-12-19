import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiMapPin,
  FiCalendar,
  FiCheck,
  FiAlertCircle,
  FiArrowRight
} from 'react-icons/fi'
import InputField from '../../../components/forms/InputField'
import SelectField from '../../../components/forms/SelectField'
import TextareaField from '../../../components/forms/TextareaField'
import Button from '../../../components/common/Button'
import { requestService } from '../../../services/request.service'
import { useSubscription } from '../../../contexts/SubscriptionContext'
import { SERVICE_TYPES } from '../../../utils/constants'

const PostRequest = () => {
  const navigate = useNavigate()
  const { limits } = useSubscription()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: '',
    budget: {
      min: '',
      max: '',
      currency: 'KES'
    },
    location: {
      city: '',
    },
    date: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('budget.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        budget: { ...prev.budget, [field]: value }
      }))
    } else if (name.startsWith('location.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters'
    }
    
    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required'
    }
    
    return newErrors
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.budget.min || formData.budget.min <= 0) {
      newErrors['budget.min'] = 'Minimum budget is required'
    }
    
    if (!formData.budget.max || formData.budget.max <= 0) {
      newErrors['budget.max'] = 'Maximum budget is required'
    }
    
    if (parseInt(formData.budget.min) > parseInt(formData.budget.max)) {
      newErrors['budget.max'] = 'Maximum budget must be greater than minimum'
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.date = 'Date must be in the future'
      }
    }
    
    return newErrors
  }

  const handleNext = () => {
    const validationErrors = validateStep1()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateStep2()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setLoading(true)
    setErrors({})
    
    try {
      // Prepare data for API
      const requestData = {
        ...formData,
        budget: {
          min: parseInt(formData.budget.min),
          max: parseInt(formData.budget.max),
          currency: 'KES'
        },
        date: new Date(formData.date).toISOString(),
      }
      
      const response = await requestService.createRequest(requestData)
      if (response.success) {
        navigate('/dashboard/client/requests')
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create request' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a New Request</h1>
        <p className="text-gray-600 mt-2">
          Find the perfect creative for your photography or videography project
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {step > 1 ? <FiCheck className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm mt-2 text-gray-600">Project Details</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {step > 2 ? <FiCheck className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-sm mt-2 text-gray-600">Budget & Location</span>
          </div>
        </div>
      </div>

      {/* Limit Warning */}
      {limits && limits.activeRequests && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">
                Active Requests: {limits.activeRequests} limit
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                You can have up to {limits.activeRequests} active requests at a time.
                Upgrade your plan for more active requests.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-8">
            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Details</h2>
              
              <InputField
                label="Request Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                required
                placeholder="e.g., Wedding Photography in Nairobi"
                helperText="Be specific about what you need"
                className="mb-6"
              />
              
              <TextareaField
                label="Project Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                required
                rows={6}
                placeholder="Describe your project in detail, explaining what you're looking for"
                helperText="Detailed descriptions attract better proposals"
                className="mb-6"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <SelectField
                  label="Service Type"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  error={errors.serviceType}
                  required
                  options={SERVICE_TYPES.map(service => ({ 
                    value: service.value, 
                    label: service.label 
                  }))}
                  placeholder="Select service type"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center md:justify-end">
              <Button
                type="button"
                className='text-white flex items-center'
                variant="primary"
                onClick={handleNext}
                size="large"
              >
                <span className='mr-2'>Continue to Budget & Location</span>
                <FiArrowRight />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Budget */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                Budget Range (KES)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputField
                  label="Minimum Budget"
                  name="budget.min"
                  type="number"
                  value={formData.budget.min}
                  onChange={handleChange}
                  error={errors['budget.min']}
                  required
                  placeholder="KES 5000"
                  helperText="Minimum amount you're willing to pay"
                />
                
                <InputField
                  label="Maximum Budget"
                  name="budget.max"
                  type="number"
                  value={formData.budget.max}
                  onChange={handleChange}
                  error={errors['budget.max']}
                  required
                  placeholder="KES 25000"
                  helperText="Maximum amount you're willing to pay"
                />
              </div>

            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiMapPin className="w-5 h-5 mr-2" />
                Location
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <InputField
                  label="City/Town (optional)"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="e.g., Nairobi, Westlands, Kilimani"
                />
              </div>
  
            </div>

            {/* Date & Duration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiCalendar className="w-5 h-5 mr-2" />
                Timing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Project Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  error={errors.date}
                  required
                  leftIcon={<FiCalendar className="text-gray-400" />}
                  helperText="When do you need the creative?"
                />
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">📝 Important Information</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Your request can receive up to 5 proposals from creatives</li>
                <li>• You'll be able to view creative portfolios and reviews</li>
                <li>• After accepting a proposal, you'll connect via WhatsApp</li>
                <li>• Klick n Shoot doesn't handle payments - you pay the creative directly</li>
                <li>• You can close your request at any time</li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                size="large"
              >
                ← Back
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                className='text-white'
                size="large"
                loading={loading}
              >
                Post Request
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default PostRequest