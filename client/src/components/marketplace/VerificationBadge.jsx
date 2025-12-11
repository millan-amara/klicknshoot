import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi'
import Badge from '../ui/Badge'

const VerificationBadge = ({ status, size = 'small' }) => {
  const getBadgeProps = (status) => {
    switch (status) {
      case 'verified':
        return {
          variant: 'success',
          icon: FiCheckCircle,
          text: 'Verified'
        }
      case 'pending':
        return {
          variant: 'warning',
          icon: FiClock,
          text: 'Verification Pending'
        }
      case 'rejected':
        return {
          variant: 'danger',
          icon: FiXCircle,
          text: 'Verification Rejected'
        }
      default:
        return {
          variant: 'default',
          icon: null,
          text: 'Not Verified'
        }
    }
  }

  const { variant, icon: Icon, text } = getBadgeProps(status)

  return (
    <Badge variant={variant} size={size}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {text}
    </Badge>
  )
}

export default VerificationBadge