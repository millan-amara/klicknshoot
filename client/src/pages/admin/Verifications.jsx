import { useState, useEffect } from 'react'
import { FiCheck, FiX, FiEye, FiInstagram, FiYoutube, FiGlobe } from 'react-icons/fi'
import { adminService } from '../../services/admin.service'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { toast } from 'react-hot-toast'

const AdminVerifications = () => {
  const [loading, setLoading] = useState(true)
  const [verifications, setVerifications] = useState([])
  const [selectedCreative, setSelectedCreative] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    setLoading(true)
    try {
      const response = await adminService.getPendingVerifications()
      setVerifications(response.creatives || [])
    } catch (error) {
      toast.error('Failed to fetch verifications')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewCreativeDetails = (creative) => {
    setSelectedCreative(creative)
    setShowModal(true)
  }

  const handleVerification = async (creativeId, status) => {
    setProcessing(true)
    try {
      await adminService.updateVerificationStatus(creativeId, status)
      toast.success(`Verification ${status === 'approved' ? 'approved' : 'rejected'}`)
      fetchVerifications() // Refresh list
      setShowModal(false)
    } catch (error) {
      toast.error(`Failed to ${status} verification`)
    } finally {
      setProcessing(false)
    }
  }

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'instagram': return <FiInstagram className="text-pink-600" />
      case 'youtube': return <FiYoutube className="text-red-600" />
      case 'website': return <FiGlobe className="text-blue-600" />
      default: return <FiGlobe />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Creative Verifications</h1>
          <p className="text-gray-600 mt-2">
            Review and verify creative profiles. {verifications.length} pending verification{verifications.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Verifications List */}
      <Card className="overflow-hidden">
        {verifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending verifications at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creative
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Social Links
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verifications.map((creative) => (
                  <tr key={creative._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={creative.profilePicture || `https://ui-avatars.com/api/?name=${creative.firstName}+${creative.lastName}`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {creative.firstName} {creative.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {creative.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {creative.socialLinks?.slice(0, 3).map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {getSocialIcon(link.platform)}
                          </a>
                        ))}
                        {creative.socialLinks?.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{creative.socialLinks.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(creative.verification?.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => viewCreativeDetails(creative)}
                        >
                          <FiEye className="mr-1" />
                          Review
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Verification Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Review Creative Verification"
        size="large"
      >
        {selectedCreative && (
          <div className="space-y-6">
            {/* Creative Info */}
            <div className="flex items-start space-x-4">
              <img
                className="h-20 w-20 rounded-full"
                src={selectedCreative.profilePicture || `https://ui-avatars.com/api/?name=${selectedCreative.firstName}+${selectedCreative.lastName}`}
                alt=""
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCreative.firstName} {selectedCreative.lastName}
                </h3>
                <p className="text-gray-600">{selectedCreative.email}</p>
                <p className="text-gray-600">{selectedCreative.phone}</p>
                <p className="text-gray-600 mt-1">{selectedCreative.location?.city}, {selectedCreative.location?.county}</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {selectedCreative.bio || 'No bio provided'}
              </p>
            </div>

            {/* Social Links */}
            {selectedCreative.socialLinks && selectedCreative.socialLinks.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Social Links</h4>
                <div className="space-y-2">
                  {selectedCreative.socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center p-2 border border-gray-200 rounded-lg">
                      {getSocialIcon(link.platform)}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline truncate"
                      >
                        {link.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {selectedCreative.portfolio && selectedCreative.portfolio.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Portfolio ({selectedCreative.portfolio.length} items)</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCreative.portfolio.slice(0, 4).map((item, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500">Video</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleVerification(selectedCreative._id, 'rejected')}
                loading={processing}
                className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
              >
                <FiX className="mr-1" />
                Reject
              </Button>
              <Button
                onClick={() => handleVerification(selectedCreative._id, 'approved')}
                loading={processing}
                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
              >
                <FiCheck className="mr-1" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminVerifications