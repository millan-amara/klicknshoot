import { useState } from 'react'
import { FiImage, FiVideo, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import Modal from '../common/Modal'

const PortfolioGallery = ({ items = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const images = items.filter(item => item.mediaType === 'image')
  const videos = items.filter(item => item.mediaType === 'video')

  const handleItemClick = (index) => {
    setSelectedIndex(index)
    setIsModalOpen(true)
  }

  const handlePrevious = () => {
    setSelectedIndex(prev => 
      prev === 0 ? items.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setSelectedIndex(prev => 
      prev === items.length - 1 ? 0 : prev + 1
    )
  }

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FiImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No portfolio items yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.slice(0, 6).map((item, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => handleItemClick(index)}
          >
            <img
              src={item.url}
              alt={item.title || 'Portfolio image'}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center">
              <FiImage className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-3 rounded-b-lg">
                <p className="text-white text-sm font-medium">{item.title}</p>
              </div>
            )}
          </div>
        ))}
        
        {videos.slice(0, 3).map((item, index) => (
          <div
            key={`video-${index}`}
            className="relative group cursor-pointer"
            onClick={() => handleItemClick(images.length + index)}
          >
            <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
              <FiVideo className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center">
              <FiVideo className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-3 rounded-b-lg">
                <p className="text-white text-sm font-medium">{item.title}</p>
              </div>
            )}
          </div>
        ))}

        {/* View More Overlay */}
        {items.length > 6 && (
          <div
            className="relative group cursor-pointer"
            onClick={() => handleItemClick(0)}
          >
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">View All</p>
                <p className="text-sm text-gray-500">{items.length} items</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg"></div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="full"
        showCloseButton={false}
      >
        {selectedItem && (
          <div className="relative h-full">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              aria-label="Close"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              aria-label="Previous"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              aria-label="Next"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>

            {/* Media content */}
            <div className="h-full flex items-center justify-center p-4">
              {selectedItem.mediaType === 'image' ? (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title || 'Portfolio image'}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-full max-w-4xl">
                  <video
                    src={selectedItem.url}
                    controls
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Caption */}
            {(selectedItem.title || selectedItem.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-6">
                <div className="max-w-4xl mx-auto text-white">
                  {selectedItem.title && (
                    <h3 className="text-xl font-semibold mb-2">{selectedItem.title}</h3>
                  )}
                  {selectedItem.description && (
                    <p className="text-gray-200">{selectedItem.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default PortfolioGallery