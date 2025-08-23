// components/Footer/Footer.js
'use client'; // Necessário para usar hooks do React (useState, useEffect)

import { useState, useEffect } from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      // Formato DD/MM/YYYY HH:MM:SS
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      setCurrentDateTime(now.toLocaleDateString('pt-BR', options));
    };

    // Atualiza a data/hora a cada segundo
    const intervalId = setInterval(updateDateTime, 1000);

    // Chama a função uma vez imediatamente para exibir ao carregar
    updateDateTime();

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <span className={styles.copyright}>&copy; {new Date().getFullYear()} Sistema de Gestão.</span>
        <span className={styles.dateTime}>{currentDateTime}</span>
      </div>
    </footer>
  );
};

export default Footer;