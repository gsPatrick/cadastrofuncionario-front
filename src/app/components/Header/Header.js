'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiLogOut, FiUser, FiGrid, FiUsers } from 'react-icons/fi';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return null; // Evita renderizar o header antes de saber quem é o usuário
  }

  // Mapeia a role da API para um nome amigável para exibição
  const getRoleName = (role) => {
    if (role === 'admin') return 'Administrador';
    if (role === 'rh') return 'Recursos Humanos';
    return 'Usuário';
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/dashboard" className={styles.appTitle}>
          <Image
            src="/logo.png"
            alt="Logo SEPLAN GOV PI"
            width={240}
            height={73}
            priority
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
          
          {/* ========================================================== */}
          {/* CORREÇÃO APLICADA AQUI                                   */}
          {/* Verifica se a role do usuário é 'admin' para mostrar o link. */}
          {/* ========================================================== */}
          {user?.role === 'admin' && (
            <Link 
              href="/gerenciar-usuarios" 
              className={`${styles.navLink} ${pathname === '/gerenciar-usuarios' ? styles.navLinkActive : ''}`}
            >
              <FiUsers />
              <span>Gerenciar Usuários</span>
            </Link>
          )}
        </nav>

        {/* --- INFORMAÇÕES DO USUÁRIO --- */}
        <div className={styles.userInfo}>
          <FiUser className={styles.userIcon} />
          <div className={styles.userNameRole}>
            <span className={styles.userName}>Olá, <strong>{user?.name || 'Usuário'}</strong></span>
            <span className={styles.userRole}>{getRoleName(user?.role)}</span>
          </div>
          <button onClick={logout} className={styles.logoutButton}>
            <FiLogOut />
            <span className={styles.logoutText}>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;