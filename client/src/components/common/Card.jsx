const Card = ({ children, className = '', hover = false, padding = true, ...props }) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card