// components/Header/Header.js
'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut, FiUser, FiGrid, FiUsers } from 'react-icons/fi'; // NOVAS IMPORTAÇÕES DE ÍCONES
import styles from './Header.module.css';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname(); // HOOK PARA VERIFICAR A ROTA ATIVA
  const userName = "Usuário RH"; // Mock
  const userRole = "Administrador"; // Mock

  const handleLogout = () => {
    console.log("Usuário deslogado");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* TÍTULO DO APP CONTINUA SENDO UM LINK PARA O DASHBOARD */}
        <Link href="/dashboard" className={styles.appTitle}>
          Sistema RH
        </Link>

        {/* --- NOVO MENU DE NAVEGAÇÃO ADICIONADO --- */}
        <nav className={styles.navigation}>
          <Link 
            href="/dashboard" 
            className={`${styles.navLink} ${pathname === '/dashboard' ? styles.navLinkActive : ''}`}
          >
            <FiGrid />
            <span>Dashboard</span>
          </Link>
          <Link 
            href="/gerenciar-usuarios" 
            className={`${styles.navLink} ${pathname === '/gerenciar-usuarios' ? styles.navLinkActive : ''}`}
          >
            <FiUsers />
            <span>Gerenciar Usuários</span>
          </Link>
        </nav>
        {/* --- FIM DO NOVO MENU --- */}

        <div className={styles.userInfo}>
          <FiUser className={styles.userIcon} />
          <div className={styles.userNameRole}>
            <span className={styles.userName}>Olá, <strong>{userName}</strong></span>
            <span className={styles.userRole}>{userRole}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FiLogOut />
            <span className={styles.logoutText}>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;