import { forwardRef } from 'react'
import { FiCheck } from 'react-icons/fi'

const Checkbox = forwardRef(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            {...props}
          />
          <div className={`
            w-5 h-5 border rounded flex items-center justify-center
            ${props.checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
            ${error ? 'border-red-500' : ''}
          `}>
            {props.checked && (
              <FiCheck className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
        {label && (
          <span className="ml-3 text-sm text-gray-700">{label}</span>
        )}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox