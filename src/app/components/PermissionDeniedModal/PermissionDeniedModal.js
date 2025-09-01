'use client';

import Modal from '../Modal/Modal';
import { FiLock } from 'react-icons/fi';
import styles from './PermissionDeniedModal.module.css';

const PermissionDeniedModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Acesso Negado">
      <div className={styles.content}>
        <FiLock size={50} className={styles.icon} />
        <h3 className={styles.message}>Você não tem permissão para realizar esta ação.</h3>
        <p className={styles.description}>
          Por favor, entre em contato com um administrador do sistema se você acredita que isso é um erro.
        </p>
        <button onClick={onClose} className={styles.closeButton}>
          Entendido
        </button>
      </div>
    </Modal>
  );
};

export default PermissionDeniedModal;