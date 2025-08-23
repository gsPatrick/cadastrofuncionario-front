// components/Modal/Modal.js
'use client';

import { FiX } from 'react-icons/fi';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  // Impede que o clique no conteúdo do modal o feche
  const handleContentClick = (e) => e.stopPropagation();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={handleContentClick}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </header>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;