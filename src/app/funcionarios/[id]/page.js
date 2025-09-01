'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiUser, FiFileText, FiMessageSquare, FiClock, FiUpload, FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiSearch } from 'react-icons/fi';
import styles from './details.module.css';
import { API_BASE_URL, getAuthHeaders } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext'; // 1. IMPORTAR O useAuth

// Componentes Reutilizáveis
import Modal from '../../components/Modal/Modal';
import Spinner from '../../components/Spinner/Spinner';
import DocumentUploadForm from '../../components/DocumentUploadForm/DocumentUploadForm';
import AnnotationForm from '../../components/AnnotationForm/AnnotationForm';
import EmployeeForm from '../../components/EmployeeForm/EmployeeForm';
import DocumentEditForm from '../../components/DocumentEditForm/DocumentEditForm';

// Mapeamento de nomes de campos para nomes amigáveis
const fieldDisplayNames = {
  fullName: 'Nome Completo',
  registrationNumber: 'Matrícula',
  institutionalLink: 'Vínculo Institucional',
  position: 'Cargo',
  role: 'Função',
  department: 'Departamento',
  currentAssignment: 'Lotação Atual',
  admissionDate: 'Data de Admissão',
  educationLevel: 'Nível de Formação',
  educationArea: 'Área de Formação',
  dateOfBirth: 'Data de Nascimento',
  gender: 'Gênero',
  maritalStatus: 'Estado Civil',
  hasChildren: 'Possui Filhos',
  numberOfChildren: 'Número de Filhos',
  cpf: 'CPF',
  rg: 'RG',
  rgIssuer: 'Órgão Emissor (RG)',
  addressStreet: 'Logradouro',
  addressNumber: 'Número (Endereço)',
  addressComplement: 'Complemento',
  addressNeighborhood: 'Bairro',
  addressCity: 'Cidade',
  addressState: 'Estado (UF)',
  addressZipCode: 'CEP',
  emergencyContactPhone: 'Telefone de Emergência',
  mobilePhone1: 'Celular 1',
  mobilePhone2: 'Celular 2',
  institutionalEmail: 'E-mail Institucional',
  personalEmail: 'E-mail Pessoal',
  functionalStatus: 'Situação Funcional',
  generalObservations: 'Observações Gerais',
  comorbidity: 'Comorbidade',
  disability: 'Deficiência',
  bloodType: 'Tipo Sanguíneo',
  id: 'ID do Sistema',
  createdAt: 'Data de Cadastro',
  updatedAt: 'Última Atualização',
};

export default function FuncionarioDetailsPage() {
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  
  // Estados dos Modais
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [isEditDocumentModalOpen, setIsEditDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  
  // Estados para pesquisa
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  const [annotationSearchTerm, setAnnotationSearchTerm] = useState('');
  
  const params = useParams();
  const router = useRouter();
  const { id: employeeId } = params;

  // 2. OBTER O HOOK DE AUTENTICAÇÃO
  const { hasPermission } = useAuth();

  const serverRootUrl = API_BASE_URL.replace('/api', '');

  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    if (!employee) setIsLoading(true);
    setError('');
    
    try {
      const [employeeRes, historyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/employees/${employeeId}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/employees/${employeeId}/history`, { headers: getAuthHeaders() })
      ]);

      if (employeeRes.status === 401) {
        router.push('/login');
        return;
      }
      if (!employeeRes.ok) {
        const errorData = await employeeRes.json();
        throw new Error(errorData.message || 'Falha ao buscar dados do funcionário.');
      }
      const employeeData = await employeeRes.json();
      setEmployee(employeeData.data.employee);

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.data.history);
      } else {
        console.warn('Não foi possível carregar o histórico do funcionário.');
        setHistory([]);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, router, employee]);

  useEffect(() => {
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
      await fetchData(); 
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
        router.push('/dashboard'); 
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

      const authHeadersWithoutContentType = { ...getAuthHeaders() };
      delete authHeadersWithoutContentType['Content-Type']; 

      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/documents`, {
        method: 'POST',
        headers: authHeadersWithoutContentType, 
        body: apiFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar arquivos.');
      }

      setIsUploadModalOpen(false);
      await fetchData(); 
      alert('Documentos enviados com sucesso!');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };
  
  const handleOpenEditDocumentModal = (document) => { 
    setEditingDocument(document);
    setIsEditDocumentModalOpen(true);
  };

  const handleEditDocumentSubmit = async (formData) => { 
    if (!editingDocument) return;
    try {
      const url = `${API_BASE_URL}/employees/${employeeId}/documents/${editingDocument.id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar metadados do documento.');
      }

      setIsEditDocumentModalOpen(false);
      setEditingDocument(null);
      await fetchData();
      alert('Metadados do documento atualizados com sucesso!');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        const url = `${API_BASE_URL}/employees/${employeeId}/documents/${documentId}`;
        const response = await fetch(url, {
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
      ? `${API_BASE_URL}/employees/${employeeId}/annotations/${editingAnnotation.id}` 
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
        const url = `${API_BASE_URL}/employees/${employeeId}/annotations/${annotationId}`;
        const response = await fetch(url, {
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

  // Lógica de filtragem para documentos e anotações
  const filteredDocuments = useMemo(() => {
    if (!employee?.documents) return [];
    if (!documentSearchTerm) return employee.documents;

    const lowercasedTerm = documentSearchTerm.toLowerCase();
    return employee.documents.filter(doc =>
      doc.documentType.toLowerCase().includes(lowercasedTerm) ||
      (doc.description && doc.description.toLowerCase().includes(lowercasedTerm))
    );
  }, [employee?.documents, documentSearchTerm]);

  const filteredAnnotations = useMemo(() => {
    if (!employee?.annotations) return [];
    if (!annotationSearchTerm) return employee.annotations;

    const lowercasedTerm = annotationSearchTerm.toLowerCase();
    return employee.annotations.filter(note =>
      note.title.toLowerCase().includes(lowercasedTerm) ||
      note.content.toLowerCase().includes(lowercasedTerm) ||
      note.category.toLowerCase().includes(lowercasedTerm)
    );
  }, [employee?.annotations, annotationSearchTerm]);


  if (isLoading) return <div className={styles.centered}><Spinner size="large" color="var(--cor-azul-escuro)" /></div>;
  if (error) return <div className={`${styles.centered} ${styles.errorText}`}>{error}</div>;
  if (!employee) return <div className={styles.centered}>Funcionário não encontrado.</div>;

  return (
    <main className={styles.pageContainer}>
      {/* BOTÃO DE VOLTAR */}
      <div className={styles.pageHeaderActions}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <FiArrowLeft />
          Voltar
        </button>
      </div>
      
      {/* CABEÇALHO DO PERFIL */}
      <header className={styles.profileHeader}>
        <div className={styles.profileAvatar}><FiUser size={50} /></div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>{employee.fullName}</h1>
          <p className={styles.profileMeta}>
            <strong>Matrícula:</strong> {employee.registrationNumber} | <strong>Cargo:</strong> {employee.position}
          </p>
        </div>
        {/* ========================================================== */}
        {/* 3. APLICAÇÃO DAS PERMISSÕES NOS BOTÕES DE AÇÃO PRINCIPAIS */}
        {/* ========================================================== */}
        <div className={styles.profileActions}>
          {hasPermission('employee:edit') && (
            <button className={styles.editHeaderBtn} onClick={() => setIsEditEmployeeModalOpen(true)}>
              <FiEdit /> Editar Dados
            </button>
          )}
          {hasPermission('employee:delete') && (
            <button className={styles.deleteHeaderBtn} onClick={handleDeleteEmployee}>
              <FiTrash2 /> Excluir Funcionário
            </button>
          )}
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
              .filter(([key]) => key !== 'documents' && key !== 'annotations') 
              .map(([key, value]) => (
              <div key={key} className={styles.detailItem}>
                <strong className={styles.detailLabel}>{fieldDisplayNames[key] || key}</strong>
                <span className={styles.detailValue}>
                  {value !== null && value !== undefined && value !== '' ? String(value) : '-'}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Documentos Anexados</h2>
              <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Pesquisar por tipo ou descrição..."
                  className={styles.searchInput}
                  value={documentSearchTerm}
                  onChange={(e) => setDocumentSearchTerm(e.target.value)}
                />
              </div>
              {/* 4. APLICAÇÃO DA PERMISSÃO NO BOTÃO DE UPLOAD */}
              {hasPermission('document:create') && (
                <button className={styles.actionButton} onClick={() => setIsUploadModalOpen(true)}>
                  <FiUpload /> Fazer Upload
                </button>
              )}
            </div>
            {filteredDocuments.length > 0 ? (
              <ul className={styles.list}>
                {filteredDocuments.map(doc => (
                  <li key={doc.id} className={styles.listItem}>
                    <a 
                      href={`${serverRootUrl}/${doc.filePath}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download 
                      className={styles.documentLinkContent}
                    >
                      <FiFileText className={styles.listIcon} />
                      <div className={styles.listItemContent}>
                        <strong>{doc.documentType}</strong>
                        <span>{doc.description || 'Sem descrição'}</span>
                        <small>Enviado em: {new Date(doc.uploadedAt).toLocaleString('pt-BR')}</small>
                      </div>
                    </a>
                    {/* 5. APLICAÇÃO DAS PERMISSÕES NOS BOTÕES DE AÇÃO DO ITEM */}
                    <div className={styles.listItemActions}>
                        {hasPermission('document:edit') && (
                          <button className={styles.editButton} onClick={() => handleOpenEditDocumentModal(doc)} title="Editar Metadados"><FiEdit /></button>
                        )}
                        {hasPermission('document:delete') && (
                          <button className={styles.deleteButton} onClick={() => handleDeleteDocument(doc.id)} title="Excluir Documento">
                            <FiTrash2 />
                          </button>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (<p className={styles.emptyState}>{documentSearchTerm ? 'Nenhum documento encontrado para sua pesquisa.' : 'Nenhum documento anexado.'}</p>)}
          </div>
        )}

        {activeTab === 'annotations' && (
           <div>
            <div className={styles.contentHeader}>
              <h2>Anotações</h2>
              <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Pesquisar por título, conteúdo ou categoria..."
                  className={styles.searchInput}
                  value={annotationSearchTerm}
                  onChange={(e) => setAnnotationSearchTerm(e.target.value)}
                />
              </div>
              {/* 6. APLICAÇÃO DA PERMISSÃO NO BOTÃO DE NOVA ANOTAÇÃO */}
              {hasPermission('annotation:create') && (
                <button className={styles.actionButton} onClick={() => handleOpenAnnotationModal()}>
                  <FiPlus /> Nova Anotação
                </button>
              )}
            </div>
            {filteredAnnotations.length > 0 ? (
              <ul className={styles.list}>
                {filteredAnnotations.map(note => (
                  <li key={note.id} className={styles.listItem}>
                    <FiMessageSquare className={styles.listIcon} />
                    <div className={styles.listItemContent}>
                      <strong>{note.title}</strong>
                      <span>{note.content}</span>
                      <small><strong>Categoria:</strong> {note.category} | <strong>Criado em:</strong> {new Date(note.annotationDate).toLocaleString('pt-BR')}</small>
                      {note.updatedAt && new Date(note.updatedAt) > new Date(note.annotationDate) && (
                        <small>Última Edição: {new Date(note.updatedAt).toLocaleString('pt-BR')}</small>
                      )}
                    </div>
                    {/* 7. APLICAÇÃO DAS PERMISSÕES NOS BOTÕES DE AÇÃO DO ITEM */}
                    <div className={styles.listItemActions}>
                      {hasPermission('annotation:edit') && (
                        <button className={styles.editButton} onClick={() => handleOpenAnnotationModal(note)}><FiEdit /></button>
                      )}
                      {hasPermission('annotation:delete') && (
                        <button className={styles.deleteButton} onClick={() => handleDeleteAnnotation(note.id)}><FiTrash2 /></button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (<p className={styles.emptyState}>{annotationSearchTerm ? 'Nenhuma anotação encontrada para sua pesquisa.' : 'Nenhuma anotação registrada.'}</p>)}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className={styles.contentHeader}><h2>Histórico de Alterações</h2></div>
            {history.length > 0 ? (
              <div className={styles.tableWrapper}>
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
              </div>
            ) : (<p className={styles.emptyState}>Nenhum histórico de alterações encontrado.</p>)}
          </div>
        )}
      </div>

      {/* MODAIS */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Enviar Documentos">
        <DocumentUploadForm onSubmit={handleUploadSubmit} onCancel={() => setIsUploadModalOpen(false)} />
      </Modal>
      
      <Modal isOpen={isEditDocumentModalOpen} onClose={() => setIsEditDocumentModalOpen(false)} title="Editar Metadados do Documento">
        <DocumentEditForm initialData={editingDocument} onSubmit={handleEditDocumentSubmit} onCancel={() => setIsEditDocumentModalOpen(false)} />
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