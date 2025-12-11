import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className = ''
}) => {
  const icons = {
    info: FiInfo,
    success: FiCheckCircle,
    warning: FiAlertCircle,
    error: FiAlertCircle
  }

  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  }

  const Icon = icons[type]

  return (
    <div className={`
      border rounded-lg p-4
      ${styles[type]}
      ${className}
    `}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 mt-0.5 mr-3 shrink-0`} />
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          {message && (
            <p className="text-sm">{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 p-1 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert