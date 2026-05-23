import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
