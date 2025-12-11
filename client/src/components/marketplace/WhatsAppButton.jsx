import { FiMessageCircle } from 'react-icons/fi'
import Button from '../common/Button'

const WhatsAppButton = ({ phoneNumber, message, children, className = '' }) => {
  const formatPhoneNumber = (phone) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '')
    
    // Handle different Kenyan phone formats
    if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return cleaned
    } else if (cleaned.length === 9 && cleaned.startsWith('7')) {
      return `254${cleaned}`
    } else if (cleaned.length === 10 && cleaned.startsWith('07')) {
      return `254${cleaned.slice(1)}`
    }
    
    return phone
  }

  const handleClick = () => {
    const formattedPhone = formatPhoneNumber(phoneNumber)
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      variant="success"
      onClick={handleClick}
      className={`${className} bg-green-600 hover:bg-green-700`}
      leftIcon={<FiMessageCircle />}
    >
      {children || 'Chat on WhatsApp'}
    </Button>
  )
}

export default WhatsAppButton