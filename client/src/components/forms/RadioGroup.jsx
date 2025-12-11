const RadioGroup = ({
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  className = '',
  name
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="sr-only"
            />
            <div className={`
              w-5 h-5 border rounded-full flex items-center justify-center mr-3
              ${value === option.value ? 'border-blue-600' : 'border-gray-300'}
            `}>
              {value === option.value && (
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
              )}
            </div>
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default RadioGroup