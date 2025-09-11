// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser(); 
        setUser(data);
      } catch (err) {
        console.error('Erreur récupération utilisateur:', err);
      }
    };
    fetchUser();
  }, []);

  const logOut = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
