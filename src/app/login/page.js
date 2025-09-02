'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Importado para usar a logo
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './login.module.css';
import { API_BASE_URL } from '../../utils/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = useAuth();
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/admin-users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: usuario, password: senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao tentar fazer login.');
      }

      auth.login(data.token, data.data.user);
    } catch (err) {
      setError(err.message);
      console.error('Falha no login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      {/* ========================================================== */}
      {/* ESTRUTURA ALTERADA AQUI                                    */}
      {/* Novo container para agrupar a logo e o formulário.       */}
      {/* ========================================================== */}
      <div className={styles.loginBox}>
        <div className={styles.logoContainer}>
          <Image
            src="/logo.png"
            alt="Logo SEPLAN GOV PI"
            width={220} // Ajuste de tamanho para a página de login
            height={67}
            priority
          />
        </div>

        <div className={styles.formWrapper}>
          {/* O título h1 foi removido para dar destaque à logo */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="usuario">Usuário</label>
              <input type="text" id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} required disabled={isLoading} />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="senha">Senha</label>
              <div className={styles.passwordWrapper}>
                <input type={mostrarSenha ? 'text' : 'password'} id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={isLoading} />
                <span className={styles.eyeIcon} onClick={() => setMostrarSenha(!mostrarSenha)}>
                  {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {error && <p className={styles.errorMessage}>{error}</p>}

            <button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <Link href="/recuperar-senha" className={styles.link}>
            Esqueceu a senha?
          </Link>
        </div>
      </div>
    </main>
  );
}