// components/DocumentForm/DocumentForm.js
'use client';
import { useState, useEffect } from 'react';
import styles from './DocumentForm.module.css';

const DocumentForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ tipo: '', descricao: '' });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="tipo">Tipo de Documento</label>
        <input type="text" id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="descricao">Descrição</label>
        <input type="text" id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} required />
      </div>
      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar</button>
      </div>
    </form>
  );
};
export default DocumentForm;