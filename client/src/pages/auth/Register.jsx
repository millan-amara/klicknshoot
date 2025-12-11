import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiPhone, FiCamera } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import InputField from '../../components/forms/InputField'
import SelectField from '../../components/forms/SelectField'
import Button from '../../components/common/Button'

const Register = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'client'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    return newErrors
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^(\+254|0)?[71]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid Kenyan phone number'
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
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber
      }
      
      const result = await register(userData)
      if (result.success) {
        const dashboardPath = result.user.role === 'creative' 
          ? '/dashboard/creative' 
          : '/dashboard/client'
        
        navigate(dashboardPath)
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <FiCamera className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join Klick n Shoot Kenya
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your account in just a few steps
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className="text-xs mt-2 text-gray-600">Account</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="text-xs mt-2 text-gray-600">Profile</span>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">I want to join as a:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleSelect('client')}
                className={`p-4 border rounded-lg text-center transition-all ${
                  formData.role === 'client'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-lg mb-2">👤</div>
                <p className="font-medium">Client</p>
                <p className="text-sm text-gray-600 mt-1">Looking for creatives</p>
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleSelect('creative')}
                className={`p-4 border rounded-lg text-center transition-all ${
                  formData.role === 'creative'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-lg mb-2">📷</div>
                <p className="font-medium">Creative</p>
                <p className="text-sm text-gray-600 mt-1">Photographer/Videographer</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                <InputField
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  leftIcon={<FiMail className="text-gray-400" />}
                  placeholder="you@example.com"
                />

                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  leftIcon={<FiLock className="text-gray-400" />}
                  placeholder="At least 6 characters"
                  helperText="Must be at least 6 characters"
                />

                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  leftIcon={<FiLock className="text-gray-400" />}
                  placeholder="••••••••"
                />

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="large"
                    className="flex-1"
                    onClick={handleNext}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    required
                    leftIcon={<FiUser className="text-gray-400" />}
                    placeholder="John"
                  />

                  <InputField
                    label="Last Name"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    required
                    leftIcon={<FiUser className="text-gray-400" />}
                    placeholder="Doe"
                  />
                </div>

                <InputField
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                  required
                  leftIcon={<FiPhone className="text-gray-400" />}
                  placeholder="0712 345 678"
                  helperText="Enter your Kenyan phone number"
                />

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="large"
                    className="flex-1"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    className="flex-1"
                    loading={loading}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/login">
                <Button
                  type="button"
                  variant="outline"
                  size="large"
                  className="w-full"
                >
                  Sign in instead
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs text-gray-600 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register