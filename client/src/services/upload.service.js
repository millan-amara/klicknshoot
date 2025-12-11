import api from './api'

export const uploadService = {
  uploadToCloudinary: async (file, preset = 'framefinder_portfolio') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', preset)
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error.message)
      }
      
      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes
      }
    } catch (error) {
      throw error
    }
  },

  uploadPortfolioItem: async (creativeId, file, metadata) => {
    try {
      // First upload to Cloudinary
      const cloudinaryResult = await uploadService.uploadToCloudinary(file)
      
      // Then save to our database
      const response = await api.post(`/creatives/${creativeId}/portfolio`, {
        ...metadata,
        url: cloudinaryResult.url,
        thumbnail: cloudinaryResult.url, // You might want to create a thumbnail version
        mediaType: file.type.startsWith('image') ? 'image' : 'video'
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  }
}