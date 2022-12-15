import { useLocation, Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const RequireAuth = ({ allowedRoles }) => {
    const location = useLocation()
    const { roles } = useAuth()

    const content = (
        roles.some(role => allowedRoles.includes(role)) // if one role is true, that's all we need
            ? <Outlet />
            : <Navigate to='/login' state={{ from: location }} replace />
    )
    return content
}

export default RequireAuth