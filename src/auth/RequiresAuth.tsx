import { Navigate, Outlet } from "react-router-dom";

const RequiresAuth = () => {
    return localStorage.getItem('accessToken') ? <Outlet /> : <Navigate to='/login' replace />;
}

export default RequiresAuth