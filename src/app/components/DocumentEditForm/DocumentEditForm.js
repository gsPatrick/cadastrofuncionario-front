// components/DocumentEditForm/DocumentEditForm.js
'use client';
import { useState, useEffect } from 'react';
import styles from './DocumentEditForm.module.css'; // Ajustar o caminho/nome do CSS

const DocumentEditForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ 
    documentType: initialData?.documentType || '', 
    description: initialData?.description || '' 
  });

  useEffect(() => {
    // Atualiza o formulário se initialData mudar
    if (initialData) {
      setFormData({
        documentType: initialData.documentType || '',
        description: initialData.description || ''
      });
    }
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
        <label htmlFor="documentType">Tipo de Documento</label>
        <input 
          type="text" 
          id="documentType" 
          name="documentType" 
          value={formData.documentType} 
          onChange={handleChange} 
          required 
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="description">Descrição</label>
        <input 
          type="text" 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
        />
      </div>
      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar</button>
      </div>
    </form>
  );
};
export default DocumentEditForm;