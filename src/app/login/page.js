// app/login/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './login.module.css';
import { API_BASE_URL } from '../../utils/api'; // IMPORTADO

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // NOVO ESTADO: Loading
  const [error, setError] = useState(''); // NOVO ESTADO: Erro
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

      // Salva o token no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      
      console.log('Login bem-sucedido, redirecionando...');
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      console.error('Falha no login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Sistema de Gestão de Funcionários</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* ... campos de input (sem alterações) ... */}
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

          {error && <p className={styles.errorMessage}>{error}</p>} {/* Exibe mensagem de erro */}

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <Link href="/recuperar-senha" className={styles.link}>
          Esqueceu a senha?
        </Link>
      </div>
    </main>
  );
}