import { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiImage, FiVideo, FiExternalLink, FiEye } from 'react-icons/fi'
import { creativeService } from '../../../services/creative.service'
import { useUser } from '../../../contexts/UserContext'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import InputField from '../../../components/forms/InputField'
import TextareaField from '../../../components/forms/TextareaField'
import SelectField from '../../../components/forms/SelectField'
import FileUpload from '../../../components/forms/FileUpload'
import { toast } from 'react-hot-toast'

const CreativePortfolio = () => {
  const { profile, refreshProfile } = useUser()
  const [loading, setLoading] = useState(true)
  const [portfolioItems, setPortfolioItems] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [processing, setProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'image',
    url: '',
    tags: '',
    featured: false
  })

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    setLoading(true)
    try {
      if (profile?._id) {
        const response = await creativeService.getCreativeById(profile._id)
        setPortfolioItems(response.creative?.portfolio || [])
      }
    } catch (error) {
      toast.error('Failed to fetch portfolio')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!formData.title || !formData.url) {
      toast.error('Please fill in all required fields')
      return
    }

    setProcessing(true)
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      await creativeService.addPortfolioItem(profile._id, {
        ...formData,
        tags: tagsArray
      })
      
      toast.success('Portfolio item added successfully')
      setShowAddModal(false)
      resetForm()
      fetchPortfolio()
      refreshProfile()
    } catch (error) {
      toast.error('Failed to add portfolio item')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!selectedItem) return

    setProcessing(true)
    try {
      await creativeService.removePortfolioItem(profile._id, selectedItem._id)
      
      toast.success('Portfolio item deleted successfully')
      setShowDeleteModal(false)
      setSelectedItem(null)
      fetchPortfolio()
      refreshProfile()
    } catch (error) {
      toast.error('Failed to delete portfolio item')
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'image',
      url: '',
      tags: '',
      featured: false
    })
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return <FiImage className="text-blue-600" />
      case 'video': return <FiVideo className="text-red-600" />
      case 'website': return <FiExternalLink className="text-green-600" />
      default: return <FiImage />
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
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
          <p className="text-gray-600 mt-2">
            Showcase your best work to attract more clients. You have {portfolioItems.length} portfolio items.
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddModal(true)}
          leftIcon={<FiPlus />}
        >
          Add Portfolio Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <FiImage className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {portfolioItems.filter(item => item.type === 'image').length}
              </div>
              <div className="text-sm text-gray-600">Photos</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <FiVideo className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {portfolioItems.filter(item => item.type === 'video').length}
              </div>
              <div className="text-sm text-gray-600">Videos</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <FiEye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {portfolioItems.filter(item => item.featured).length}
              </div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Grid */}
      {portfolioItems.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiImage className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No portfolio items yet</h3>
          <p className="text-gray-600 mb-6">Add your best work to showcase your skills to clients</p>
          <Button
            onClick={() => setShowAddModal(true)}
            leftIcon={<FiPlus />}
          >
            Add Your First Portfolio Item
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-100">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiVideo className="w-12 h-12 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiExternalLink className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Featured Badge */}
                {item.featured && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-white bg-opacity-90 text-gray-700">
                    {item.type}
                  </span>
                </div>
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      size="small"
                      variant="outline"
                      className="bg-white"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <FiEye className="mr-1" />
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outline"
                      className="bg-white"
                      onClick={() => {
                        setSelectedItem(item)
                        setShowDeleteModal(true)
                      }}
                    >
                      <FiTrash2 className="mr-1" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                  {getTypeIcon(item.type)}
                </div>
                
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {item.description}
                </p>
                
                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {/* Metadata */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.views || 0} views
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Portfolio Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Add at least 5 high-quality portfolio items to build credibility</li>
            <li>• Include a mix of photos and videos to showcase different skills</li>
            <li>• Write descriptive titles and detailed descriptions for each item</li>
            <li>• Use relevant tags to help clients find your work</li>
            <li>• Feature your best 3-5 items to make a strong first impression</li>
            <li>• Update your portfolio regularly with your latest work</li>
          </ul>
        </div>
      </Card>

      {/* Add Portfolio Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          resetForm()
        }}
        title="Add Portfolio Item"
        size="medium"
      >
        <div className="space-y-4">
          <InputField
            label="Title"
            placeholder="e.g., Nairobi Wedding Photography"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          
          <TextareaField
            label="Description"
            placeholder="Describe this work, equipment used, challenges overcome..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
          />
          
          <SelectField
            label="Type"
            value={formData.type}
            onChange={(value) => setFormData({...formData, type: value})}
            options={[
              { value: 'image', label: 'Image' },
              { value: 'video', label: 'Video' },
              { value: 'website', label: 'Website/External Link' }
            ]}
          />
          
          <InputField
            label="URL"
            placeholder="https://example.com/your-work.jpg"
            value={formData.url}
            onChange={(e) => setFormData({...formData, url: e.target.value})}
            required
            helperText={formData.type === 'image' 
              ? "Direct link to image (JPG, PNG)" 
              : formData.type === 'video'
              ? "YouTube or Vimeo link"
              : "Website URL"
            }
          />
          
          <InputField
            label="Tags (comma-separated)"
            placeholder="wedding, nairobi, outdoor, portrait"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            helperText="Helps clients find your work"
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Feature this item (appears at top of profile)
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                resetForm()
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              loading={processing}
            >
              Add to Portfolio
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedItem(null)
        }}
        title="Delete Portfolio Item"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedItem(null)
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteItem}
              loading={processing}
              className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CreativePortfolio