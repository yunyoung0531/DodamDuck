import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
});

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState('');

    useEffect(() => {
        console.log('현재 로그인된 사용자: ', user);
    }, [user]);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('AuthContext.js 의 userData', userData);
    }; 
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== "undefined") {
        const userData = JSON.parse(storedUser);
        setUser(userData);
    }
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        setUser('');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};