import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function PrivateRoute({ children, roles = [] }) {
    const { user, isLoading } = useAuth()
    console.log("PrivateRoute - user:", user);

    if (isLoading) {
        return <div className="text-center mt-10">Checking authentication...</div>; // optional spinner
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" />
    }

    return children
}
