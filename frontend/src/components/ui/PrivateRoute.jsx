import { Navigate } from 'react-router-dom'
import authService from '../../services/authService'

// Redirects to /login if user is not authenticated
export default function PrivateRoute({ children }) {
  return authService.isLoggedIn() ? children : <Navigate to="/login" replace />
}
