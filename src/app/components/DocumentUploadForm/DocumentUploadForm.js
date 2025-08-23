// components/DocumentUploadForm/DocumentUploadForm.js
'use client';
import { useState, useRef } from 'react';
import { FiUploadCloud, FiX, FiFile } from 'react-icons/fi';
import styles from './DocumentUploadForm.module.css';

const DocumentUploadForm = ({ onSubmit, onCancel }) => {
  const [files, setFiles] = useState([]);
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isUploading, setIsUploading] = useState(false); // Estado de carregamento
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => { setFiles(prev => [...prev, ...Array.from(e.target.files)]); };
  const handleRemoveFile = (fileName) => { setFiles(prev => prev.filter(file => file.name !== fileName)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !tipo) {
      alert('Por favor, selecione ao menos um arquivo e defina o tipo.');
      return;
    }
    
    setIsUploading(true);

    // --- SIMULAÇÃO DE UPLOAD ---
    // Em uma aplicação real, aqui você usaria 'fetch' ou 'axios' para enviar 'FormData'
    // Exemplo:
    // const formData = new FormData();
    // files.forEach(file => formData.append('files', file));
    // formData.append('tipo', tipo);
    // formData.append('descricao', descricao);
    // await fetch('/api/upload', { method: 'POST', body: formData });

    // Apenas para simulação, esperamos 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Upload simulado com sucesso:", { tipo, descricao, files });
    onSubmit({ tipo, descricao, files });
    setIsUploading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.uploadArea} onClick={() => !isUploading && fileInputRef.current.click()}>
        <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} disabled={isUploading} />
        <FiUploadCloud size={40} />
        <p>Clique aqui para selecionar os arquivos</p>
        <span>PDF, DOC, PNG, JPG</span>
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          <h4>Arquivos Selecionados:</h4>
          <ul>
            {files.map(file => (
              <li key={file.name}>
                <FiFile />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <button type="button" onClick={() => handleRemoveFile(file.name)} disabled={isUploading}><FiX /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.metadata}>
        <div className={styles.inputGroup}><label htmlFor="tipo">Tipo de Documento *</label><input type="text" id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} required disabled={isUploading} /></div>
        <div className={styles.inputGroup}><label htmlFor="descricao">Descrição</label><input type="text" id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} disabled={isUploading} /></div>
      </div>

      {isUploading && (
        <div className={styles.progressContainer}>
            <p>Enviando arquivos...</p>
            <div className={styles.progressBar}></div>
        </div>
      )}

      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={isUploading}>Cancelar</button>
        <button type="submit" className={styles.saveButton} disabled={isUploading}>
            {isUploading ? 'Enviando...' : 'Enviar Arquivos'}
        </button>
      </div>
    </form>
  );
};
export default DocumentUploadForm;