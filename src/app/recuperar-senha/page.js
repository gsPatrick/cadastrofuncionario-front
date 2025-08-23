// app/recuperar-senha/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './recuperar-senha.module.css';
import Spinner from '../components/Spinner/Spinner'; // Importa o Spinner

export default function SolicitarRecuperacaoPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsSuccess(false);

    // --- SIMULAÇÃO DE ENVIO DE E-MAIL ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula um atraso de rede

    // Em uma aplicação real, aqui você faria uma chamada para o seu backend:
    // try {
    //   const response = await fetch('/api/auth/request-password-reset', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email }),
    //   });
    //   if (response.ok) {
    //     setMessage('Um link de redefinição de senha foi enviado para o seu e-mail.');
    //     setIsSuccess(true);
    //   } else {
    //     const errorData = await response.json();
    //     setMessage(errorData.message || 'Erro ao solicitar redefinição de senha. Tente novamente.');
    //     setIsSuccess(false);
    //   }
    // } catch (error) {
    //   setMessage('Erro de conexão. Verifique sua internet.');
    //   setIsSuccess(false);
    // }

    setMessage('Se o e-mail estiver cadastrado, você receberá um link de redefinição em breve.');
    setIsSuccess(true);
    setEmail(''); // Limpa o campo após a simulação
    setIsSubmitting(false);
  };

  return (
    <main className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Recuperar Senha</h1>
        <p className={styles.description}>Digite seu e-mail cadastrado para receber um link de redefinição de senha.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {message && (
            <p className={`${styles.message} ${isSuccess ? styles.success : styles.error}`}>
              {message}
            </p>
          )}

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="small" /> : 'Enviar'}
          </button>
        </form>

        <Link href="/login" className={styles.link}>
          Voltar para o Login
        </Link>
      </div>
    </main>
  );
}