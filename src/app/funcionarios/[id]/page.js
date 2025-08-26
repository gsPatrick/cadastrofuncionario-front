// app/funcionarios/[id]/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiUser, FiFileText, FiMessageSquare, FiClock, FiUpload, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import styles from './details.module.css';
import { API_BASE_URL, getAuthHeaders } from '../../../utils/api';

// Componentes Reutilizáveis
import Modal from '../../components/Modal/Modal';
import Spinner from '../../components/Spinner/Spinner';
import DocumentUploadForm from '../../components/DocumentUploadForm/DocumentUploadForm';
import AnnotationForm from '../../components/AnnotationForm/AnnotationForm';
import EmployeeForm from '../../components/EmployeeForm/EmployeeForm';

export default function FuncionarioDetailsPage() {
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details'); // details, documents, annotations, history
  
  // Estados dos Modais
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const { id: employeeId } = params;

  // Constrói a URL base do servidor para os links de download
  const serverRootUrl = API_BASE_URL.replace('/api', '');

  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    // Não seta loading em re-fetch para uma experiência mais suave
    if (!employee) setIsLoading(true);
    setError('');
    
    try {
      // Busca os dados principais (que já incluem documentos e anotações)
      const employeeRes = await fetch(`${API_BASE_URL}/employees/${employeeId}`, { headers: getAuthHeaders() });
      if (employeeRes.status === 401) return router.push('/login');
      if (!employeeRes.ok) throw new Error('Falha ao buscar dados do funcionário.');
      const employeeData = await employeeRes.json();
      setEmployee(employeeData.data.employee);

      // Busca o histórico funcional
      const historyRes = await fetch(`${API_BASE_URL}/employees/${employeeId}/history`, { headers: getAuthHeaders() });
      if (!historyRes.ok) throw new Error('Falha ao buscar histórico do funcionário.');
      const historyData = await historyRes.json();
      setHistory(historyData.data.history);

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, router, employee]);

  useEffect(() => {
    // A dependência foi removida para executar apenas uma vez na montagem
    // e ser chamado manualmente por outras funções (fetchData())
    if (employeeId) {
        fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  // --- LÓGICA DE CRUD DO FUNCIONÁRIO ---

  const handleEditEmployeeSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar funcionário.');
      }

      setIsEditEmployeeModalOpen(false);
      await fetchData(); // Re-busca os dados para atualizar a página
      alert('Funcionário atualizado com sucesso!');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDeleteEmployee = async () => {
    if (window.confirm(`Tem certeza que deseja excluir permanentemente o funcionário "${employee.fullName}"? Esta ação não pode ser desfeita.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error('Falha ao excluir o funcionário.');
        }

        alert('Funcionário excluído com sucesso.');
        router.push('/dashboard'); // Redireciona para o dashboard após a exclusão
      } catch (err) {
        alert(`Erro: ${err.message}`);
      }
    }
  };

  // --- LÓGICA DE DOCUMENTOS ---
  const handleUploadSubmit = async (formData) => {
    try {
      const apiFormData = new FormData();
      formData.files.forEach(file => {
        apiFormData.append('files', file);
      });
      apiFormData.append('documentType', formData.documentType);
      apiFormData.append('description', formData.description);

      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/documents`, {
        method: 'POST',
        headers: getAuthHeaders(), // Não defina Content-Type, o browser faz isso para FormData
        body: apiFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar arquivos.');
      }

      setIsUploadModalOpen(false);
      await fetchData(); // Re-busca os dados para atualizar a lista
      alert('Documentos enviados com sucesso!');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };
  
  const handleDeleteDocument = async (documentId) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao excluir documento.');
        await fetchData();
        alert('Documento excluído com sucesso.');
      } catch (err) {
        alert(`Erro: ${err.message}`);
      }
    }
  };

  // --- LÓGICA DE ANOTAÇÕES ---
  const handleOpenAnnotationModal = (annotation = null) => {
    setEditingAnnotation(annotation);
    setIsAnnotationModalOpen(true);
  };
  
  const handleAnnotationSubmit = async (formData) => {
    const isEditing = !!editingAnnotation;
    const url = isEditing 
      ? `${API_BASE_URL}/annotations/${editingAnnotation.id}`
      : `${API_BASE_URL}/employees/${employeeId}/annotations`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar anotação.');
      }
      
      setIsAnnotationModalOpen(false);
      setEditingAnnotation(null);
      await fetchData();
      alert(`Anotação ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDeleteAnnotation = async (annotationId) => {
    if (confirm('Tem certeza que deseja excluir esta anotação?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/annotations/${annotationId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Falha ao excluir anotação.');
        await fetchData();
        alert('Anotação excluída com sucesso.');
      } catch (err) {
        alert(`Erro: ${err.message}`);
      }
    }
  };

  if (isLoading) return <div className={styles.centered}><Spinner size="large" color="var(--cor-azul-escuro)" /></div>;
  if (error) return <div className={`${styles.centered} ${styles.errorText}`}>{error}</div>;
  if (!employee) return <div className={styles.centered}>Funcionário não encontrado.</div>;

  return (
    <main className={styles.pageContainer}>
      {/* CABEÇALHO DO PERFIL */}
      <header className={styles.profileHeader}>
        <div className={styles.profileAvatar}><FiUser size={50} /></div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>{employee.fullName}</h1>
          <p className={styles.profileMeta}>
            <strong>Matrícula:</strong> {employee.registrationNumber} | <strong>Cargo:</strong> {employee.position}
          </p>
        </div>
        <div className={styles.profileActions}>
          <button className={styles.editHeaderBtn} onClick={() => setIsEditEmployeeModalOpen(true)}><FiEdit /> Editar Dados</button>
          <button className={styles.deleteHeaderBtn} onClick={handleDeleteEmployee}><FiTrash2 /> Excluir Funcionário</button>
        </div>
      </header>

      {/* NAVEGAÇÃO POR ABAS */}
      <nav className={styles.tabsNav}>
        <button onClick={() => setActiveTab('details')} className={activeTab === 'details' ? styles.tabButtonActive : styles.tabButton}><FiUser /> Detalhes</button>
        <button onClick={() => setActiveTab('documents')} className={activeTab === 'documents' ? styles.tabButtonActive : styles.tabButton}><FiFileText /> Documentos</button>
        <button onClick={() => setActiveTab('annotations')} className={activeTab === 'annotations' ? styles.tabButtonActive : styles.tabButton}><FiMessageSquare /> Anotações</button>
        <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? styles.tabButtonActive : styles.tabButton}><FiClock /> Histórico</button>
      </nav>

      {/* CONTEÚDO DAS ABAS */}
      <div className={styles.tabContent}>
        {activeTab === 'details' && (
          <div className={styles.detailsGrid}>
            {Object.entries(employee)
              .filter(([key]) => key !== 'documents' && key !== 'annotations') // Filtra para não mostrar arrays complexos
              .map(([key, value]) => (
              <div key={key} className={styles.detailItem}>
                <strong className={styles.detailLabel}>{key}</strong>
                <span className={styles.detailValue}>{String(value) || '-'}</span>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Documentos Anexados</h2>
              <button className={styles.actionButton} onClick={() => setIsUploadModalOpen(true)}><FiUpload /> Fazer Upload</button>
            </div>
            {employee.documents && employee.documents.length > 0 ? (
              <ul className={styles.list}>
                {employee.documents.map(doc => (
                  <a 
                    key={doc.id}
                    href={`${serverRootUrl}/${doc.filePath}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    download 
                    className={styles.documentLink}
                  >
                    <li className={styles.listItem}>
                      <FiFileText className={styles.listIcon} />
                      <div className={styles.listItemContent}>
                        <strong>{doc.documentType}</strong>
                        <span>{doc.description || 'Sem descrição'}</span>
                        <small>Enviado em: {new Date(doc.uploadedAt).toLocaleString('pt-BR')}</small>
                      </div>
                      <button 
                        className={styles.deleteButton} 
                        onClick={(e) => {
                          e.preventDefault(); 
                          handleDeleteDocument(doc.id);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </li>
                  </a>
                ))}
              </ul>
            ) : (<p className={styles.emptyState}>Nenhum documento anexado.</p>)}
          </div>
        )}

        {activeTab === 'annotations' && (
           <div>
            <div className={styles.contentHeader}>
              <h2>Anotações</h2>
              <button className={styles.actionButton} onClick={() => handleOpenAnnotationModal()}><FiPlus /> Nova Anotação</button>
            </div>
            {employee.annotations && employee.annotations.length > 0 ? (
              <ul className={styles.list}>
                {employee.annotations.map(note => (
                  <li key={note.id} className={styles.listItem}>
                    <FiMessageSquare className={styles.listIcon} />
                    <div className={styles.listItemContent}>
                      <strong>{note.title}</strong>
                      <span>{note.content}</span>
                      <small><strong>Categoria:</strong> {note.category} | <strong>Criado em:</strong> {new Date(note.annotationDate).toLocaleString('pt-BR')}</small>
                    </div>
                    <div className={styles.listItemActions}>
                      <button className={styles.editButton} onClick={() => handleOpenAnnotationModal(note)}><FiEdit /></button>
                      <button className={styles.deleteButton} onClick={() => handleDeleteAnnotation(note.id)}><FiTrash2 /></button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (<p className={styles.emptyState}>Nenhuma anotação registrada.</p>)}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className={styles.contentHeader}><h2>Histórico de Alterações</h2></div>
            {history.length > 0 ? (
              <table className={styles.historyTable}>
                <thead><tr><th>Data</th><th>Campo Alterado</th><th>Valor Antigo</th><th>Valor Novo</th><th>Alterado Por</th></tr></thead>
                <tbody>
                  {history.map(item => (
                    <tr key={item.id}>
                      <td>{new Date(item.createdAt).toLocaleString('pt-BR')}</td>
                      <td>{item.fieldName}</td>
                      <td>{item.oldValue}</td>
                      <td>{item.newValue}</td>
                      <td>{item.changedBy?.name || 'Sistema'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (<p className={styles.emptyState}>Nenhum histórico de alterações encontrado.</p>)}
          </div>
        )}
      </div>

      {/* MODAIS */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Enviar Documentos">
        <DocumentUploadForm onSubmit={handleUploadSubmit} onCancel={() => setIsUploadModalOpen(false)} />
      </Modal>
      <Modal isOpen={isAnnotationModalOpen} onClose={() => setIsAnnotationModalOpen(false)} title={editingAnnotation ? 'Editar Anotação' : 'Nova Anotação'}>
        <AnnotationForm initialData={editingAnnotation} onSubmit={handleAnnotationSubmit} onCancel={() => setIsAnnotationModalOpen(false)} />
      </Modal>
      <Modal isOpen={isEditEmployeeModalOpen} onClose={() => setIsEditEmployeeModalOpen(false)} title="Editar Dados do Funcionário">
        <EmployeeForm 
          employeeData={employee} 
          onSubmit={handleEditEmployeeSubmit} 
          onCancel={() => setIsEditEmployeeModalOpen(false)}
          isEditing={true}
        />
      </Modal>
    </main>
  );
}