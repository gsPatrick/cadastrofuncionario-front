// app/dashboard/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiPlus, FiDownload, FiLogOut } from 'react-icons/fi';
import styles from './dashboard.module.css';
import { API_BASE_URL, getAuthHeaders } from '../../utils/api';

// Componentes
import EmployeeTable from '../components/EmployeeTable/EmployeeTable';
import Modal from '../components/Modal/Modal';
import EmployeeForm from '../components/EmployeeForm/EmployeeForm';

export default function DashboardPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Estados para busca, filtro e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSetor, setFilterSetor] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Estados dos modais, exportação e submissão de formulário
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Função para buscar funcionários da API (agora com paginação)
  const fetchFuncionarios = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('page', pagination.currentPage);
      params.append('limit', 10); // Define um limite de 10 itens por página
      if (searchTerm) params.append('search', searchTerm);
      if (filterSetor) params.append('department', filterSetor);

      const response = await fetch(`${API_BASE_URL}/employees?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken'); // Limpa token inválido
        router.push('/login');
        return;
      }
      if (!response.ok) throw new Error('Falha ao buscar dados dos funcionários.');
      
      const data = await response.json();
      setFuncionarios(data.data.employees);
      setPagination(data.pagination); // Atualiza o estado da paginação com dados da API
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterSetor, pagination.currentPage, router]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  // Mapeia os dados do formulário para o formato esperado pela API
  const mapFormDataToApi = (formData) => ({
    fullName: formData.nome,
    registrationNumber: formData.matricula,
    institutionalLink: formData.vinculoInstitucional,
    position: formData.cargo,
    department: formData.setor,
    admissionDate: formData.dataAdmissao,
    dateOfBirth: formData.dataNascimento,
    gender: formData.sexo,
    maritalStatus: formData.estadoCivil,
    hasChildren: formData.possuiFilhos || false,
    numberOfChildren: formData.numeroDeFilhos || 0,
    cpf: formData.cpf.replace(/\D/g, ''),
    rg: formData.rg,
    addressStreet: formData.logradouro,
    addressNumber: formData.numero,
    addressComplement: formData.complemento,
    addressNeighborhood: formData.bairro,
    addressCity: formData.cidade,
    addressState: formData.estado,
    addressZipCode: formData.cep.replace(/\D/g, ''),
    emergencyContactPhone: formData.telefoneEmergencia,
    mobilePhone1: formData.telefone,
    institutionalEmail: formData.emailInstitucional,
    personalEmail: formData.emailPessoal,
    functionalStatus: formData.situacaoFuncional,
  });
  
  // Mapeia os dados da API para o formato esperado pelo formulário (PARA EDIÇÃO)
  const mapApiToFormData = (employee) => ({
    nome: employee.fullName,
    matricula: employee.registrationNumber,
    vinculoInstitucional: employee.institutionalLink,
    cargo: employee.position,
    setor: employee.department,
    dataAdmissao: employee.admissionDate,
    dataNascimento: employee.dateOfBirth,
    sexo: employee.gender,
    estadoCivil: employee.maritalStatus,
    possuiFilhos: employee.hasChildren,
    numeroDeFilhos: employee.numberOfChildren,
    cpf: employee.cpf,
    rg: employee.rg,
    logradouro: employee.addressStreet,
    numero: employee.addressNumber,
    complemento: employee.addressComplement,
    bairro: employee.addressNeighborhood,
    cidade: employee.addressCity,
    estado: employee.addressState,
    cep: employee.addressZipCode,
    telefoneEmergencia: employee.emergencyContactPhone,
    telefone: employee.mobilePhone1,
    emailInstitucional: employee.institutionalEmail,
    emailPessoal: employee.personalEmail,
    situacaoFuncional: employee.functionalStatus,
  });

  // Funções do Modal de ADIÇÃO
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleAddEmployeeSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const apiData = mapFormDataToApi(formData);
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(apiData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar funcionário.');
      }
      handleCloseAddModal();
      fetchFuncionarios();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções do Modal de EDIÇÃO
  const handleOpenEditModal = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };
  const handleEditEmployeeSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const apiData = mapFormDataToApi(formData);
      const response = await fetch(`${API_BASE_URL}/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(apiData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar funcionário.');
      }
      handleCloseEditModal();
      fetchFuncionarios();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ação de DELETAR
  const handleDelete = async (id) => {
    if (confirm(`Atenção: Esta ação é irreversível.\n\nConfirma a exclusão do funcionário ID ${id}?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (response.status !== 204) throw new Error('Erro ao excluir funcionário.');
        fetchFuncionarios();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Função de LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  // Funções de PAGINAÇÃO
  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };
  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };
  
  const handleExport = async (format) => {
    setIsExportMenuOpen(false);
    try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filterSetor) params.append('department', filterSetor);

        const response = await fetch(`${API_BASE_URL}/employees/export/${format}?${params.toString()}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Falha ao exportar para ${format}.`);

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `funcionarios_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert(err.message);
    }
  };
  
  const renderContent = () => {
    if (isLoading) return <p className={styles.centeredMessage}>Carregando funcionários...</p>;
    if (error) return <p className={`${styles.centeredMessage} ${styles.error}`}>{error}</p>;
    if (funcionarios.length === 0) return <p className={styles.centeredMessage}>Nenhum funcionário encontrado.</p>;
    return <EmployeeTable employees={funcionarios} onEdit={handleOpenEditModal} onDelete={handleDelete} />;
  };

  const setoresUnicos = [...new Set(funcionarios.map(f => f.department).filter(Boolean))].sort();

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel de Funcionários</h1>
        <div className={styles.actions}>
          <button className={styles.logoutButton} onClick={handleLogout}><FiLogOut /> Sair</button>
          <div className={styles.exportContainer}>
            <button className={styles.actionButton} onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}><FiDownload /> Exportar</button>
            {isExportMenuOpen && (
              <div className={styles.exportMenu}>
                <button onClick={() => handleExport('csv')}>Exportar para CSV</button>
                <button onClick={() => handleExport('excel')}>Exportar para Excel</button>
                <button onClick={() => handleExport('pdf')}>Exportar para PDF</button>
              </div>
            )}
          </div>
          <button className={styles.addButton} onClick={handleOpenAddModal}>
            <FiPlus /> Adicionar Funcionário
          </button>
        </div>
      </header>

      <div className={styles.contentCard}>
         <div className={styles.tableControls}>
            <div className={styles.searchWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome, matrícula, setor..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.filters}>
              <select value={filterSetor} onChange={(e) => setFilterSetor(e.target.value)}>
                <option value="">Todos os Setores</option>
                {setoresUnicos.map(setor => <option key={setor} value={setor}>{setor}</option>)}
              </select>
            </div>
         </div>
        
        {renderContent()}
        
        <footer className={styles.pagination}>
          <button onClick={handlePrevPage} disabled={pagination.currentPage === 1}>Anterior</button>
          <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
          <button onClick={handleNextPage} disabled={pagination.currentPage === pagination.totalPages}>Próxima</button>
        </footer>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Cadastrar Novo Funcionário">
        <EmployeeForm onSubmit={handleAddEmployeeSubmit} onCancel={handleCloseAddModal} isSubmitting={isSubmitting} />
      </Modal>

      {editingEmployee && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Funcionário">
          <EmployeeForm 
            employeeData={mapApiToFormData(editingEmployee)} 
            onSubmit={handleEditEmployeeSubmit} 
            onCancel={handleCloseEditModal}
            isSubmitting={isSubmitting}
            isEditMode={true}
          />
        </Modal>
      )}
    </main>
  );
}