// components/AnnotationForm/AnnotationForm.js
'use client';
import { useState, useEffect } from 'react';
import styles from './AnnotationForm.module.css';

const AnnotationForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ titulo: '', categoria: '', conteudo: '' });

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
        <label htmlFor="titulo">Título</label>
        <input type="text" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="categoria">Categoria</label>
        <input type="text" id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="conteudo">Conteúdo</label>
        <textarea id="conteudo" name="conteudo" value={formData.conteudo} onChange={handleChange} rows="4" required />
      </div>
      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar</button>
      </div>
    </form>
  );
};
export default AnnotationForm;