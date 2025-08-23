// components/Header/Header.js
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut, FiUser } from 'react-icons/fi';
import styles from './Header.module.css';

const Header = () => {
  const router = useRouter();
  const userName = "Usuário RH"; // Mock
  const userRole = "Administrador"; // Mock

  const handleLogout = () => {
    console.log("Usuário deslogado");
    // Limpa o token de autenticação
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      {/* ... restante do JSX sem alterações ... */}
       <div className={styles.headerContent}>
        <Link href="/dashboard" className={styles.appTitle}>
          Sistema RH
        </Link>
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