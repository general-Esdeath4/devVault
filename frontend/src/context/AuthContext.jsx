import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Giriş başarılı!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Giriş yapılamadı');
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/register`, { username, email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Kayıt başarılı!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Kayıt olunamadı');
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        toast.info('Çıkış yapıldı');
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem('userInfo', JSON.stringify(newUserData));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
