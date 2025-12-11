import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to dashboard based on role or home if no role
    const redirectPath = user?.role === 'creative' 
      ? '/dashboard/creative' 
      : user?.role === 'client' 
      ? '/dashboard/client' 
      : '/'
    
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default RoleBasedRoute