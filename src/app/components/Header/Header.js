// components/Header/Header.js
'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Importa o componente de Imagem do Next.js
import { FiLogOut, FiUser, FiGrid, FiUsers } from 'react-icons/fi';
import styles from './Header.module.css';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const userName = "Usuário RH"; // Mock
  const userRole = "Administrador"; // Mock

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* ========================================================== */}
        {/* CORREÇÃO APLICADA AQUI: Título de texto substituído pela logo */}
        {/* ========================================================== */}
        <Link href="/dashboard" className={styles.appTitle}>
          <Image
            src="/logo.png" // Caminho para a imagem na pasta /public
            alt="Logo SEPLAN GOV PI"
            width={240}
            height={73}
            priority // Otimiza o carregamento da logo
          />
        </Link>

        {/* --- MENU DE NAVEGAÇÃO --- */}
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

        {/* --- INFORMAÇÕES DO USUÁRIO --- */}
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