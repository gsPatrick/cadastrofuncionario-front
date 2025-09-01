'use client'; // <-- A SOLUÇÃO ESTÁ AQUI


import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false); // NOVO ESTADO
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Falha ao carregar dados de autenticação.", error);
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  // ==========================================================
  // NOVAS FUNÇÕES DE PERMISSÃO
  // ==========================================================
  
  /**
   * Verifica se o usuário logado tem uma permissão específica.
   * @param {string} requiredPermission - A permissão no formato 'entidade:acao'.
   * @returns {boolean} - True se tiver permissão, false caso contrário.
   */
  const hasPermission = useCallback((requiredPermission) => {
    if (!user) return false;
    // O 'admin' sempre tem permissão.
    if (user.role === 'admin') return true;

    // Para 'rh', verifica as permissões granulares.
    if (user.role === 'rh' && user.permissions) {
      const [entity, action] = requiredPermission.split(':');
      return user.permissions[entity]?.[action] === true;
    }

    return false;
  }, [user]);

  /**
   * Executa uma função de callback apenas se o usuário tiver a permissão.
   * Caso contrário, abre o modal de acesso negado.
   * @param {string} requiredPermission - A permissão necessária.
   * @param {Function} callback - A função a ser executada se a permissão for concedida.
   */
  const runWithPermission = (requiredPermission, callback) => {
    if (hasPermission(requiredPermission)) {
      callback();
    } else {
      setIsPermissionModalOpen(true);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    hasPermission, // Exporta a função de verificação
    runWithPermission, // Exporta a função principal
    isPermissionModalOpen, // Exporta o estado do modal
    closePermissionModal: () => setIsPermissionModalOpen(false), // Exporta função para fechar
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};