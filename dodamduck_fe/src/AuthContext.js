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

    const login = (jwtToken, userData) => {
        localStorage.setItem('token', jwtToken); // 토큰 저장(JWT)
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('AuthContext.js 의 userData', userData);
    }; 

    const logout = () => {
        localStorage.removeItem('token'); // 토큰 제거
        localStorage.removeItem('user');
        setUser('');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};