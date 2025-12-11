import { FiUser } from 'react-icons/fi'

const Avatar = ({ 
  src, 
  alt, 
  size = 'medium',
  initials,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  }

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`
          ${sizeClasses[size]}
          rounded-full object-cover
          ${className}
        `}
      />
    )
  }

  if (initials) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          ${textSizes[size]}
          rounded-full bg-blue-100 text-blue-600
          flex items-center justify-center font-semibold
          ${className}
        `}
      >
        {initials}
      </div>
    )
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full bg-gray-200 text-gray-600
        flex items-center justify-center
        ${className}
      `}
    >
      <FiUser className={`${textSizes[size]}`} />
    </div>
  )
}

export default Avatar