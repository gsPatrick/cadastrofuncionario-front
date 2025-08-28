// components/AnnotationForm/AnnotationForm.js
'use client';
import { useState, useEffect } from 'react';
import styles from './AnnotationForm.module.css';

const AnnotationForm = ({ initialData = null, onSubmit, onCancel }) => {
  // Define o estado inicial com os nomes de campos que o frontend usa
  const [formData, setFormData] = useState({
    titulo: initialData?.title || '',
    categoria: initialData?.category || 'Informativo', // Valor padrão para o select
    conteudo: initialData?.content || ''
  });

  // Atualiza o formulário se um 'initialData' for passado (para edição)
  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.title || '',
        categoria: initialData.category || 'Informativo',
        conteudo: initialData.content || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // O 'onSubmit' já espera os campos 'titulo', 'conteudo', 'categoria'
    // pois o controller do backend fará o mapeamento.
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="titulo">Título</label>
        <input 
          type="text" 
          id="titulo" 
          name="titulo" 
          value={formData.titulo} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      {/* ========================================================== */}
      {/* ALTERAÇÃO PRINCIPAL: Campo de texto trocado por um select  */}
      {/* ========================================================== */}
      <div className={styles.inputGroup}>
        <label htmlFor="categoria">Categoria</label>
        <select 
          id="categoria" 
          name="categoria" 
          value={formData.categoria} 
          onChange={handleChange}
          required
          className={styles.selectInput} // Adicionando uma classe para estilização se necessário
        >
          <option value="Informativo">Informativo</option>
          <option value="Advertência">Advertência</option>
          <option value="Comunicação">Comunicação</option>
          <option value="Elogio">Elogio</option>
          <option value="Outros">Outros</option>
        </select>
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="conteudo">Conteúdo</label>
        <textarea 
          id="conteudo" 
          name="conteudo" 
          value={formData.conteudo} 
          onChange={handleChange} 
          rows="4" 
          required 
        />
      </div>
      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar</button>
      </div>
    </form>
  );
};
export default AnnotationForm;