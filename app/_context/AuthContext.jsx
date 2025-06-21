"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const decoded = jwtDecode(token); // ✅ moved here
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            avatar: decoded.avatar,
          });
        } catch (error) {
          Cookies.remove("token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (token, userData) => {
    Cookies.set("token", token, { expires: 90 });
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
    });
    router.push("/dashboard");
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
