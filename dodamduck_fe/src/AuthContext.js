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
    const [user, setUser] = useState(null); // ''->null로 변경 하여 상태 정보 유지

    useEffect(() => {
        console.log('현재 로그인된 사용자: ', user);
    }, [user]);

    useEffect(() => {
        const loadUserFromStorage = () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = sessionStorage.getItem('user');
            if (storedToken && storedUser) {
                setUser(JSON.parse(storedUser));
            }
        };

        loadUserFromStorage();
    }, []); //useEffect로 새로고침시에도 로그인 유지

    const login = (jwtToken, userData) => {
        localStorage.setItem('token', jwtToken); // 토큰 저장(JWT)
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('AuthContext.js 의 userData', userData);
    }; 

    const logout = () => {
        localStorage.removeItem('token'); //토큰 제거
        localStorage.removeItem('user');
        setUser('');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};