import { useAuth } from "../hooks/AuthProvider";
import { Navigate, Outlet } from "react-router-dom";

type Props = {
    allowedRoles: string[]
}

const ProtectedRoute = ({allowedRoles}: Props) => {
    const auth = useAuth();
    const role = auth.userProfile?.role

    if (role === undefined) {
        return <></>
    }

    return allowedRoles.includes(role) ? <Outlet /> : <Navigate to='/unauthorized' replace />
}

export default ProtectedRoute