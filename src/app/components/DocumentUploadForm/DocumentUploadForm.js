// components/DocumentUploadForm/DocumentUploadForm.js
'use client';
import { useState, useRef } from 'react';
import { FiUploadCloud, FiX, FiFile } from 'react-icons/fi';
import styles from './DocumentUploadForm.module.css';

const DocumentUploadForm = ({ onSubmit, onCancel }) => {
  const [files, setFiles] = useState([]);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };
  
  const handleRemoveFile = (fileName) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !documentType) {
      alert('Por favor, selecione ao menos um arquivo e defina o tipo do documento.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // A função onSubmit agora é a que faz a chamada para a API
      await onSubmit({ files, documentType, description });
      // Não precisa de reset aqui, o componente pai vai fechar o modal
    } catch (error) {
      // O erro é tratado no componente pai, mas paramos o loading aqui
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.uploadArea} onClick={() => !isUploading && fileInputRef.current.click()}>
        <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} disabled={isUploading} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"/>
        <FiUploadCloud size={40} />
        <p>Clique ou arraste arquivos aqui</p>
        <span>PDF, DOC, PNG, JPG permitidos</span>
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          <h4>Arquivos Selecionados:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <FiFile />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <button type="button" onClick={() => handleRemoveFile(file.name)} disabled={isUploading}><FiX /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.metadata}>
        <div className={styles.inputGroup}>
          <label htmlFor="documentType">Tipo de Documento <span className={styles.required}>*</span></label>
          <input type="text" id="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} required disabled={isUploading} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="description">Descrição</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isUploading} />
        </div>
      </div>

      {isUploading && (
        <div className={styles.progressContainer}>
            <p>Enviando arquivos...</p>
            <div className={styles.progressBar}><div className={styles.progressBarInner}></div></div>
        </div>
      )}

      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={isUploading}>Cancelar</button>
        <button type="submit" className={styles.saveButton} disabled={isUploading || files.length === 0}>
            {isUploading ? 'Enviando...' : 'Enviar Arquivos'}
        </button>
      </div>
    </form>
  );
};
export default DocumentUploadForm;