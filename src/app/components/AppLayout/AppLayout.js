'use client'; // <-- ESSA LINHA É A CHAVE DA SOLUÇÃO

import { usePathname } from 'next/navigation';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from '../../layout.module.css';
import { useAuth } from '../../context/AuthContext';
import PermissionDeniedModal from '../PermissionDeniedModal/PermissionDeniedModal';

// Rotas onde o Header/Footer não devem aparecer
const PUBLIC_ROUTES = ['/login', '/recuperar-senha'];

export default function AppLayout({ children }) {
  const pathname = usePathname(); // Hook de cliente, permitido por causa do "use client"
  const isPublicPage = PUBLIC_ROUTES.includes(pathname);
  const { isPermissionModalOpen, closePermissionModal } = useAuth();

  return (
    <>
      {isPublicPage ? (
        children // Renderiza apenas o conteúdo da página pública
      ) : (
        // Renderiza a estrutura completa para páginas privadas
        <div className={styles.bodyLayout}>
          <Header />
          <div className={styles.mainContentWrapper}>
            {children}
          </div>
          <Footer />
        </div>
      )}
      
      {/* O modal de permissão está disponível globalmente */}
      <PermissionDeniedModal 
        isOpen={isPermissionModalOpen} 
        onClose={closePermissionModal} 
      />
    </>
  );
}