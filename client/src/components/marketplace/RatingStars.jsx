import { FiStar } from 'react-icons/fi'

const RatingStars = ({ rating, maxRating = 5, size = 'medium', showNumber = true }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  const filledStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  
  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          if (index < filledStars) {
            return (
              <FiStar
                key={index}
                className={`${sizeClasses[size]} text-yellow-400 fill-current`}
              />
            )
          } else if (index === filledStars && hasHalfStar) {
            return (
              <div key={index} className="relative">
                <FiStar
                  className={`${sizeClasses[size]} text-gray-300`}
                />
                <FiStar
                  className={`${sizeClasses[size]} text-yellow-400 fill-current absolute left-0 top-0 overflow-hidden`}
                  style={{ width: '50%' }}
                />
              </div>
            )
          } else {
            return (
              <FiStar
                key={index}
                className={`${sizeClasses[size]} text-gray-300`}
              />
            )
          }
        })}
      </div>
      
      {showNumber && (
        <span className="ml-2 text-gray-700 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default RatingStars