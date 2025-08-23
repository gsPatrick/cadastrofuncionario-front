// app/redefinir-senha/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Usar useSearchParams para pegar o token
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './redefinir-senha.module.css'; // Usará o mesmo CSS da solicitação
import Spinner from '../components/Spinner/Spinner'; // Importa o Spinner

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Pega o token da URL

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // NOVO: Verifica a existência do token ao carregar a página
  useEffect(() => {
    if (!token) {
      setMessage('Token de redefinição de senha inválido ou ausente.');
      setIsSuccess(false);
      // Opcional: redirecionar para a página de solicitar recuperação após um tempo
      // setTimeout(() => router.push('/recuperar-senha'), 3000);
    }
  }, [token, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsSuccess(false);

    if (novaSenha !== confirmarSenha) {
      setMessage('As senhas não coincidem.');
      setIsSubmitting(false);
      setIsSuccess(false);
      return;
    }

    if (novaSenha.length < 6) { // Exemplo de validação mínima
        setMessage('A nova senha deve ter no mínimo 6 caracteres.');
        setIsSubmitting(false);
        setIsSuccess(false);
        return;
    }

    // --- SIMULAÇÃO DE REDEFINIÇÃO DE SENHA ---
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Em uma aplicação real, aqui você faria uma chamada para o seu backend:
    // try {
    //   const response = await fetch('/api/auth/reset-password', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ token, newPassword: novaSenha }),
    //   });
    //   if (response.ok) {
    //     setMessage('Senha redefinida com sucesso! Você será redirecionado para o login.');
    //     setIsSuccess(true);
    //     setTimeout(() => router.push('/login'), 2000); // Redireciona após sucesso
    //   } else {
    //     const errorData = await response.json();
    //     setMessage(errorData.message || 'Erro ao redefinir senha. O token pode ser inválido ou ter expirado.');
    //     setIsSuccess(false);
    //   }
    // } catch (error) {
    //   setMessage('Erro de conexão. Verifique sua internet.');
    //   setIsSuccess(false);
    // }

    setMessage('Senha redefinida com sucesso! Redirecionando para o login...');
    setIsSuccess(true);
    setNovaSenha('');
    setConfirmarSenha('');
    setIsSubmitting(false);
    setTimeout(() => router.push('/login'), 2000); // Redireciona após sucesso simulado
  };

  return (
    <main className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Crie sua Nova Senha</h1>
        
        {token ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="novaSenha">Nova Senha</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={mostrarNovaSenha ? 'text' : 'password'}
                  id="novaSenha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <span 
                  className={styles.eyeIcon} 
                  onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                >
                  {mostrarNovaSenha ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmarSenha">Confirme a Nova Senha</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={mostrarConfirmarSenha ? 'text' : 'password'}
                  id="confirmarSenha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <span 
                  className={styles.eyeIcon} 
                  onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                >
                  {mostrarConfirmarSenha ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {message && (
              <p className={`${styles.message} ${isSuccess ? styles.success : styles.error}`}>
                {message}
              </p>
            )}

            <button type="submit" className={styles.button} disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="small" /> : 'Salvar Nova Senha'}
            </button>
          </form>
        ) : (
          <p className={`${styles.message} ${styles.error}`}>{message || 'Carregando...'}</p>
        )}
      </div>
    </main>
  );
}