import { forwardRef } from 'react'
import { FiChevronDown, FiAlertCircle } from 'react-icons/fi'

const SelectField = forwardRef(({
  label,
  options = [],
  error,
  required = false,
  helperText,
  placeholder,
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
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-300'}
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            // Normalize option to always have value and label as strings
            const value = option?.value ?? option
            const label = option?.label ?? option
            return (
              <option key={value} value={value}>
                {label}
              </option>
            )
          })}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        </div>
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-8 flex items-center">
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

SelectField.displayName = 'SelectField'

export default SelectField
