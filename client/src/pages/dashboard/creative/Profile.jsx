import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiInstagram, 
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiGlobe,
  FiCamera,
  FiVideo,
  FiSave,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'
import InputField from '../../../components/forms/InputField'
import SelectField from '../../../components/forms/SelectField'
import TextareaField from '../../../components/forms/TextareaField'
import Button from '../../../components/common/Button'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import Badge from '../../../components/ui/Badge'
import { creativeService } from '../../../services/creative.service'
import { useAuth } from '../../../contexts/AuthContext'
import { useUser } from '../../../contexts/UserContext'
import { KENYA_COUNTIES, SERVICES } from '../../../utils/constants'

const CreativeProfile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, updateProfile, refreshProfile } = useUser()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phoneNumber: '',
    bio: '',
    location: {
      county: '',
      city: '',
      address: ''
    },
    services: [],
    equipment: [],
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: '',
      portfolio: ''
    }
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
        location: profile.location || { county: '', city: '', address: '' },
        services: profile.services || [],
        equipment: profile.equipment || [],
        socialLinks: profile.socialLinks || {
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
          portfolio: ''
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
    } else if (name.startsWith('socialLinks.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handleEquipmentAdd = () => {
    const newEquipment = [...formData.equipment, '']
    setFormData(prev => ({ ...prev, equipment: newEquipment }))
  }

  const handleEquipmentChange = (index, value) => {
    const newEquipment = [...formData.equipment]
    newEquipment[index] = value
    setFormData(prev => ({ ...prev, equipment: newEquipment }))
  }

  const handleEquipmentRemove = (index) => {
    const newEquipment = formData.equipment.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, equipment: newEquipment }))
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
        navigate('/dashboard/creative')
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleVerificationSubmit = async () => {
    setLoading(true)
    try {
      await creativeService.submitForVerification(profile._id)
      setShowVerificationModal(false)
      refreshProfile()
    } catch (error) {
      console.error('Error submitting for verification:', error)
    } finally {
      setLoading(false)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your creative profile and verification status
            </p>
          </div>
          
          {profile?.verification?.isVerified ? (
            <Badge variant="success" className="flex items-center">
              <FiCheckCircle className="w-4 h-4 mr-1" />
              Verified
            </Badge>
          ) : (
            <Button
              variant="primary"
              onClick={() => setShowVerificationModal(true)}
              leftIcon={profile?.verification?.isVerified ? <FiCheckCircle /> : <FiAlertCircle />}
            >
              {profile?.verification?.isVerified ? 'Verified' : 'Get Verified'}
            </Button>
          )}
        </div>
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
                Basic Information
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
                helperText="This is how clients will see you on the platform"
                placeholder="John Doe Photography"
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
                helperText="Clients will contact you via WhatsApp using this number"
                className="mb-6"
              />
              
              <TextareaField
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell clients about your experience, style, and what makes you unique..."
                helperText="Max 500 characters"
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
              
              <InputField
                label="Address (Optional)"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="Street address or landmark"
                className="mt-6"
                helperText="Only shown to clients after accepting proposals"
              />
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Services Offered</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {SERVICES.map(service => (
                  <label
                    key={service}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.services.includes(service)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="mr-3"
                    />
                    <span className="capitalize">{service}</span>
                  </label>
                ))}
              </div>
              
              <p className="text-sm text-gray-600">
                Selected services will appear on your profile and in search filters
              </p>
            </div>

            {/* Equipment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Equipment</h2>
              
              <div className="space-y-3 mb-6">
                {formData.equipment.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <InputField
                      value={item}
                      onChange={(e) => handleEquipmentChange(index, e.target.value)}
                      placeholder="e.g., Canon EOS R5, DJI Mavic 3, Godox lights"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleEquipmentRemove(index)}
                      className="ml-3 p-2 text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleEquipmentAdd}
                className="w-full"
              >
                + Add Equipment
              </Button>
            </div>
          </div>

          {/* Right Column - Social & Actions */}
          <div className="space-y-8">
            {/* Social Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Links</h2>
              
              <div className="space-y-4">
                <InputField
                  label="Instagram"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  leftIcon={<FiInstagram className="text-gray-400" />}
                  placeholder="https://instagram.com/username"
                />
                
                <InputField
                  label="Facebook"
                  name="socialLinks.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                  leftIcon={<FiFacebook className="text-gray-400" />}
                  placeholder="https://facebook.com/username"
                />
                
                <InputField
                  label="Twitter/X"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  leftIcon={<FiTwitter className="text-gray-400" />}
                  placeholder="https://twitter.com/username"
                />
                
                <InputField
                  label="YouTube"
                  name="socialLinks.youtube"
                  value={formData.socialLinks.youtube}
                  onChange={handleChange}
                  leftIcon={<FiYoutube className="text-gray-400" />}
                  placeholder="https://youtube.com/username"
                />
                
                <InputField
                  label="Portfolio Website"
                  name="socialLinks.portfolio"
                  value={formData.socialLinks.portfolio}
                  onChange={handleChange}
                  leftIcon={<FiGlobe className="text-gray-400" />}
                  placeholder="https://yourportfolio.com"
                />
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These links are used for verification and displayed on your public profile.
                </p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Status</h2>
              
              {profile?.verification?.isVerified ? (
                <div className="space-y-4">
                  <div className="flex items-center text-green-600">
                    <FiCheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Verified</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your profile has been manually verified. This helps build trust with clients.
                  </p>
                  {profile.verification.verifiedAt && (
                    <p className="text-sm text-gray-500">
                      Verified on {new Date(profile.verification.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center text-yellow-600">
                    <FiAlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Not Verified</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Get verified to appear higher in search results and build trust with clients.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Manual review of your social links</li>
                    <li>• Verification badge on your profile</li>
                    <li>• Higher visibility in search results</li>
                    <li>• Increased client trust</li>
                  </ul>
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full mt-4"
                    onClick={() => setShowVerificationModal(true)}
                  >
                    Submit for Verification
                  </Button>
                </div>
              )}
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
          </div>
        </div>
      </form>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit for Verification</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Requirements:</strong> You need at least 3 social links or a portfolio website for verification.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    {formData.socialLinks.instagram || formData.socialLinks.facebook || 
                     formData.socialLinks.twitter || formData.socialLinks.youtube ? (
                      <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-gray-300 mr-2" />
                    )}
                    <span className="text-gray-700">Social media links provided</span>
                  </div>
                  
                  <div className="flex items-center">
                    {formData.socialLinks.portfolio ? (
                      <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-gray-300 mr-2" />
                    )}
                    <span className="text-gray-700">Portfolio website</span>
                  </div>
                  
                  <div className="flex items-center">
                    {formData.bio && formData.bio.length > 50 ? (
                      <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-gray-300 mr-2" />
                    )}
                    <span className="text-gray-700">Detailed bio</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Our team will manually review your profile within 2-3 business days. You'll receive an email once verified.
                </p>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowVerificationModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="flex-1"
                  onClick={handleVerificationSubmit}
                  loading={loading}
                  disabled={!formData.socialLinks.portfolio && 
                           !formData.socialLinks.instagram && 
                           !formData.socialLinks.facebook}
                >
                  Submit for Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreativeProfile