import { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true); // ✅ New state
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false); // ✅ Done loading even if no token
      return;
    }

    try {
      const payload = jwtDecode(token);

      const isExpired = payload.exp * 1000 < Date.now(); // Convert to ms and compare
      if (isExpired) {
        console.warn("Token expired");
        logout(); // This will navigate to login
        return;
      }

      setUser(payload);
      // console.log("User payload set in context:", payload);
    } catch (error) {
      console.error("Invalid token", error);
      logout();
    } finally {
      setIsLoading(false); // ✅ Ensure loading ends
    }
  }, [token]);

  function login(token) {
    localStorage.setItem("token", token);
    setToken(token); // this triggers decoding in useEffect

    // ✅ Immediately decode and set user
    const payload = jwtDecode(token);
    setUser(payload);

    navigate("/");
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
