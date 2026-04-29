import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useContext(AuthContext);

    // Si no hay usuario en el contexto, redirigir al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si hay usuario, permite ver las rutas hijas (el Dashboard)
    return <Outlet />;
};

export default ProtectedRoute;