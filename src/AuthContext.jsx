import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// =============================================
// 📌 LISTA DE E-MAILS COM ACESSO DE ADMIN
// Adicione ou remova e-mails aqui conforme necessário.
// =============================================
const ADMIN_EMAILS = [
  'drpauloguimaraesjr@gmail.com',
  // Adicione outros e-mails de admin abaixo:
];

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user ? ADMIN_EMAILS.includes(user.email?.toLowerCase()) : false;

  const value = { user, loading, isAdmin };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
