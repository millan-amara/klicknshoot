import { forwardRef } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

const TextareaField = forwardRef(({
  label,
  error,
  required = false,
  helperText,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-300'}
            disabled:bg-gray-100 disabled:cursor-not-allowed
            resize-none
          `}
          {...props}
        />
        
        {error && (
          <div className="absolute top-2 right-2">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

TextareaField.displayName = 'TextareaField'

export default TextareaField