import { useState } from 'react'
import { FiUpload, FiX, FiImage, FiVideo } from 'react-icons/fi'

const FileUpload = ({
  label,
  accept = 'image/*,video/*',
  maxSize = 50, // MB
  maxFiles = 1,
  value = [],
  onChange,
  error,
  required = false,
  className = '',
  onUpload
}) => {
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (files) => {
    const fileArray = Array.from(files)
    
    // Validate file size
    const validFiles = fileArray.filter(file => {
      const sizeInMB = file.size / (1024 * 1024)
      return sizeInMB <= maxSize
    })
    
    if (maxFiles === 1) {
      onChange(validFiles.slice(0, 1))
    } else {
      const newFiles = [...value, ...validFiles].slice(0, maxFiles)
      onChange(newFiles)
    }
    
    if (onUpload) {
      validFiles.forEach(file => onUpload(file))
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileChange(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeFile = (index) => {
    const newFiles = value.filter((_, i) => i !== index)
    onChange(newFiles)
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return FiImage
    if (file.type.startsWith('video/')) return FiVideo
    return FiUpload
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500' : ''}
        `}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag & drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Max size: {maxSize}MB per file • Max files: {maxFiles}
        </p>
        <input
          id="file-upload"
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((file, index) => {
            const FileIcon = getFileIcon(file)
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default FileUpload