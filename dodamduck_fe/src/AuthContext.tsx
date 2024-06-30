import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

interface User {
  userName: string;
  userID: string;
  profile_url: string;
  level: number;
  verification_count: number;
  location: string;
}

interface AuthContextType {
  user: User | null;
  login: (jwtToken: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("현재 로그인된 사용자: ", user);
  }, [user]);

  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = sessionStorage.getItem("user");
      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUserFromStorage();
  }, []);

  const login = (jwtToken: string, userData: User) => {
    localStorage.setItem("token", jwtToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    console.log("AuthContext.js 의 userData", userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
