import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiGlobe,
  FiSave,
  FiBell
} from 'react-icons/fi'
import InputField from '../../../components/forms/InputField'
import SelectField from '../../../components/forms/SelectField'
import Button from '../../../components/common/Button'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { clientService } from '../../../services/client.service'
import { useAuth } from '../../../contexts/AuthContext'
import { useUser } from '../../../contexts/UserContext'
import { KENYA_COUNTIES } from '../../../utils/constants'

const ClientProfile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, updateProfile, refreshProfile } = useUser()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phoneNumber: '',
    location: {
      county: '',
      city: ''
    },
    company: {
      name: '',
      website: ''
    },
    preferences: {
      notifications: {
        email: true,
        whatsapp: true
      }
    }
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
        phoneNumber: profile.phoneNumber || '',
        location: profile.location || { county: '', city: '' },
        company: profile.company || { name: '', website: '' },
        preferences: profile.preferences || {
          notifications: {
            email: true,
            whatsapp: true
          }
        }
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }))
    } else if (name.startsWith('company.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        company: { ...prev.company, [field]: value }
      }))
    } else if (name.startsWith('preferences.')) {
      const field = name.split('.')[2]
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notifications: {
            ...prev.preferences.notifications,
            [field]: e.target.checked
          }
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setSaving(true)
    setErrors({})
    
    try {
      // Update display name if empty
      const dataToSend = {
        ...formData,
        displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`
      }
      
      const result = await updateProfile(dataToSend)
      if (result.success) {
        refreshProfile()
        navigate('/dashboard/client')
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your client profile and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiUser className="w-5 h-5 mr-2" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputField
                  label="First Name"
                  name="firstName"
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
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                  leftIcon={<FiUser className="text-gray-400" />}
                  placeholder="Doe"
                />
              </div>
              
              <InputField
                label="Display Name"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                helperText="This is how creatives will see you on the platform"
                placeholder="John Doe"
                className="mb-6"
              />
              
              <InputField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={errors.phoneNumber}
                required
                leftIcon={<FiPhone className="text-gray-400" />}
                placeholder="0712 345 678"
                helperText="Creatives will contact you via WhatsApp using this number"
                className="mb-6"
              />
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiMapPin className="w-5 h-5 mr-2" />
                Location
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="County"
                  name="location.county"
                  value={formData.location.county}
                  onChange={handleChange}
                  options={KENYA_COUNTIES.map(county => ({ value: county, label: county }))}
                  placeholder="Select your county"
                />
                
                <InputField
                  label="City/Town"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="e.g., Nairobi, Mombasa, Kisumu"
                />
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information (Optional)</h2>
              
              <InputField
                label="Company Name"
                name="company.name"
                value={formData.company.name}
                onChange={handleChange}
                placeholder="Your company or organization name"
                className="mb-6"
              />
              
              <InputField
                label="Company Website"
                name="company.website"
                value={formData.company.website}
                onChange={handleChange}
                leftIcon={<FiGlobe className="text-gray-400" />}
                placeholder="https://yourcompany.com"
                helperText="Will be displayed on your requests"
              />
            </div>
          </div>

          {/* Right Column - Preferences & Actions */}
          <div className="space-y-8">
            {/* Notification Preferences */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiBell className="w-5 h-5 mr-2" />
                Notification Preferences
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences.notifications.email"
                    checked={formData.preferences.notifications.email}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Email notifications</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences.notifications.whatsapp"
                    checked={formData.preferences.notifications.whatsapp}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">WhatsApp notifications</span>
                </label>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  You'll receive notifications for new proposals, accepted proposals, and platform updates.
                </p>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscription</span>
                  <span className="font-medium text-gray-900 capitalize">{user?.subscription}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <Button
                type="submit"
                variant="primary"
                size="large"
                loading={saving}
                className="w-full"
                leftIcon={<FiSave />}
              >
                Save Profile Changes
              </Button>
              <p className="text-sm text-gray-600 mt-3 text-center">
                Your profile will be updated immediately
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">🔒 Security Notice</h3>
              <p className="text-sm text-gray-700">
                Your phone number is only shared with creatives after you accept their proposal.
                Keep your profile information up to date for better communication.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ClientProfile