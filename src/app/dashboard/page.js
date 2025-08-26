// app/dashboard/page.js
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <<-- 1. IMPORTAÇÃO ADICIONADA
import { FiPlus, FiDownload, FiFilter, FiX, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import styles from './dashboard.module.css';
import { API_BASE_URL, getAuthHeaders } from '../../utils/api';

// Componentes
import Modal from '../components/Modal/Modal';
import EmployeeForm from '../components/EmployeeForm/EmployeeForm';

// Constante com todos os 25 campos para gerar filtros e a tabela dinamicamente
// O 'name' deve corresponder exatamente ao campo retornado pela API
const EMPLOYEE_FIELDS = [
  { name: 'fullName', label: 'Nome Completo' },
  { name: 'registrationNumber', label: 'Matrícula' },
  { name: 'cpf', label: 'CPF' },
  { name: 'rg', label: 'RG' },
  { name: 'institutionalEmail', label: 'E-mail Institucional' },
  { name: 'position', label: 'Cargo' },
  { name: 'department', label: 'Departamento' },
  { name: 'functionalStatus', label: 'Situação Funcional' },
  { name: 'institutionalLink', label: 'Vínculo Institucional' },
  { name: 'role', label: 'Função' },
  { name: 'currentAssignment', label: 'Lotação Atual' },
  { name: 'admissionDate', label: 'Data de Admissão' },
  { name: 'dateOfBirth', label: 'Data de Nascimento' },
  { name: 'gender', label: 'Gênero' },
  { name: 'maritalStatus', label: 'Estado Civil' },
  { name: 'mobilePhone1', label: 'Telefone Celular' },
  { name: 'emergencyContactPhone', label: 'Telefone de Emergência' },
  { name: 'personalEmail', label: 'E-mail Pessoal' },
  { name: 'addressStreet', label: 'Logradouro' },
  { name: 'addressNumber', label: 'Número' },
  { name: 'addressNeighborhood', label: 'Bairro' },
  { name: 'addressCity', label: 'Cidade' },
  { name: 'addressState', label: 'Estado' },
  { name: 'addressZipCode', label: 'CEP' },
  { name: 'generalObservations', label: 'Observações' },
];

// Gera o estado inicial para os filtros a partir da constante
const initialFiltersState = EMPLOYEE_FIELDS.reduce((acc, field) => {
  acc[field.name] = '';
  return acc;
}, {});

export default function DashboardPage() {
  const [allFuncionarios, setAllFuncionarios] = useState([]); // Guarda a lista completa da API
  const [filteredFuncionarios, setFilteredFuncionarios] = useState([]); // Lista a ser exibida
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Estado unificado para todos os 25 filtros
  const [filters, setFilters] = useState(initialFiltersState);
  const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/esconder filtros

  // Estados para busca rápida
  const [searchTerm, setSearchTerm] = useState('');

  // Estados dos modais e exportação
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // 1. Função para buscar funcionários da API
  const fetchFuncionarios = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, { 
        headers: getAuthHeaders() 
      });
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados dos funcionários.');
      }
      
      const data = await response.json();
      setAllFuncionarios(data.data.employees);
      setFilteredFuncionarios(data.data.employees); // Inicialmente, a lista filtrada é igual à completa
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar funcionários:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Efeito para buscar os dados na montagem do componente
  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  // 2. Efeito para aplicar filtros no CLIENT-SIDE sempre que o objeto 'filters' ou 'searchTerm' mudar
  useEffect(() => {
    let result = [...allFuncionarios];

    // Aplicar busca rápida primeiro
    if (searchTerm) {
      result = result.filter((employee) => {
        const searchFields = [
          employee.fullName,
          employee.registrationNumber,
          employee.position,
          employee.department,
          employee.cpf,
          employee.institutionalEmail
        ];
        
        return searchFields.some(field => 
          field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Aplicar filtros específicos
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((employee) =>
          employee[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    setFilteredFuncionarios(result);
  }, [filters, allFuncionarios, searchTerm]);

  // Handler para atualizar o estado dos filtros
  const handleFilterChange = (fieldName, value) => {
    setFilters(prev => ({ ...prev, [fieldName]: value }));
  };
  
  const clearAllFilters = () => {
    setFilters(initialFiltersState);
    setSearchTerm('');
  };
  
  const isAnyFilterActive = useMemo(() => 
    Object.values(filters).some(v => v !== '') || searchTerm !== '', 
    [filters, searchTerm]
  );

  // Mapeamento de campos do formulário para a API
  const mapFormDataToApi = (formData) => ({
    fullName: formData.nome || formData.fullName,
    registrationNumber: formData.matricula || formData.registrationNumber,
    institutionalLink: formData.vinculoInstitucional || formData.institutionalLink,
    position: formData.cargo || formData.position,
    role: formData.funcao || formData.role,
    department: formData.setor || formData.department,
    currentAssignment: formData.lotacao || formData.currentAssignment,
    admissionDate: formData.dataAdmissao || formData.admissionDate,
    dateOfBirth: formData.dataNascimento || formData.dateOfBirth,
    gender: formData.sexo || formData.gender,
    maritalStatus: formData.estadoCivil || formData.maritalStatus,
    cpf: (formData.cpf || '').replace(/\D/g, ''), // Remove formatação do CPF
    rg: formData.rg,
    addressStreet: formData.logradouro || formData.addressStreet,
    addressNumber: formData.numero || formData.addressNumber,
    addressComplement: formData.complemento || formData.addressComplement,
    addressNeighborhood: formData.bairro || formData.addressNeighborhood,
    addressCity: formData.cidade || formData.addressCity,
    addressState: formData.estado || formData.addressState,
    addressZipCode: (formData.cep || formData.addressZipCode || '').replace(/\D/g, ''), // Remove formatação do CEP
    emergencyContactPhone: formData.telefoneEmergencia || formData.emergencyContactPhone,
    mobilePhone1: formData.telefone || formData.mobilePhone1,
    institutionalEmail: formData.emailInstitucional || formData.institutionalEmail,
    personalEmail: formData.emailPessoal || formData.personalEmail,
    functionalStatus: formData.situacaoFuncional || formData.functionalStatus,
    generalObservations: formData.observacoes || formData.generalObservations,
    hasChildren: formData.possuiFilhos || false,
  });

  // Mapeamento de dados da API para o formulário (para edição)
  const mapApiDataToForm = (apiData) => ({
    nome: apiData.fullName,
    matricula: apiData.registrationNumber,
    vinculoInstitucional: apiData.institutionalLink,
    cargo: apiData.position,
    funcao: apiData.role,
    setor: apiData.department,
    lotacao: apiData.currentAssignment,
    dataAdmissao: apiData.admissionDate,
    dataNascimento: apiData.dateOfBirth,
    sexo: apiData.gender,
    estadoCivil: apiData.maritalStatus,
    cpf: apiData.cpf,
    rg: apiData.rg,
    logradouro: apiData.addressStreet,
    numero: apiData.addressNumber,
    complemento: apiData.addressComplement,
    bairro: apiData.addressNeighborhood,
    cidade: apiData.addressCity,
    estado: apiData.addressState,
    cep: apiData.addressZipCode,
    telefoneEmergencia: apiData.emergencyContactPhone,
    telefone: apiData.mobilePhone1,
    emailInstitucional: apiData.institutionalEmail,
    emailPessoal: apiData.personalEmail,
    situacaoFuncional: apiData.functionalStatus,
    observacoes: apiData.generalObservations,
    possuiFilhos: apiData.hasChildren,
  });
  
  // ***** FUNÇÕES DE CRUD COMPLETAS *****
  
  // Funções do Modal de ADIÇÃO
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  
  const handleAddEmployeeSubmit = async (formData) => {
    try {
      const apiData = mapFormDataToApi(formData);
      console.log('Dados enviados para API (ADD):', apiData);
      
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao cadastrar funcionário.');
      }
      
      const responseData = await response.json();
      console.log('Resposta da API (ADD):', responseData);
      
      handleCloseAddModal();
      await fetchFuncionarios(); // Atualiza a lista
      
      // Feedback de sucesso
      alert('Funcionário cadastrado com sucesso!');
      
    } catch (err) {
      console.error('Erro ao adicionar funcionário:', err);
      alert(`Erro ao cadastrar funcionário: ${err.message}`);
    }
  };

  // Funções do Modal de EDIÇÃO
  const handleOpenEditModal = (employee) => {
    console.log('Abrindo modal de edição para:', employee);
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };
  
  const handleEditEmployeeSubmit = async (formData) => {
    if (!editingEmployee) {
      alert('Erro: Nenhum funcionário selecionado para edição.');
      return;
    }
    
    try {
      const apiData = mapFormDataToApi(formData);
      console.log('Dados enviados para API (EDIT):', apiData);
      console.log('ID do funcionário:', editingEmployee.id);
      
      const response = await fetch(`${API_BASE_URL}/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao atualizar funcionário.');
      }
      
      const responseData = await response.json();
      console.log('Resposta da API (EDIT):', responseData);
      
      handleCloseEditModal();
      await fetchFuncionarios(); // Atualiza a lista
      
      // Feedback de sucesso
      alert('Funcionário atualizado com sucesso!');
      
    } catch (err) {
      console.error('Erro ao editar funcionário:', err);
      alert(`Erro ao atualizar funcionário: ${err.message}`);
    }
  };

  // Ação de DELETAR
  const handleDelete = async (id, employeeName = '') => {
    const confirmMessage = employeeName 
      ? `Confirma a exclusão do funcionário "${employeeName}"?`
      : `Confirma a exclusão do funcionário ID ${id}?`;
      
    if (window.confirm(confirmMessage)) {
      try {
        console.log('Deletando funcionário ID:', id);
        
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Erro ao excluir funcionário.');
        }
        
        console.log('Funcionário deletado com sucesso');
        await fetchFuncionarios(); // Atualiza a lista
        
        // Feedback de sucesso
        alert('Funcionário excluído com sucesso!');
        
      } catch (err) {
        console.error('Erro ao deletar funcionário:', err);
        alert(`Erro ao excluir funcionário: ${err.message}`);
      }
    }
  };

  // ***** FUNÇÕES DE EXPORTAÇÃO *****
  const handleExport = async (format) => {
    console.log(`Exportando para ${format.toUpperCase()}...`);
    setIsExportMenuOpen(false);
    
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      // Adicionar filtros ativos aos parâmetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/employees/export/${format}?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao exportar para ${format}.`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `funcionarios_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      console.log(`Exportação para ${format} concluída com sucesso`);
      
    } catch (err) {
      console.error('Erro na exportação:', err);
      alert(`Erro ao exportar: ${err.message}`);
    }
  };

  // Função para formatar dados para exibição
  const formatDisplayValue = (value, fieldName) => {
    if (!value) return '-';
    
    // Formatação específica para alguns campos
    switch (fieldName) {
      case 'cpf':
        return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      case 'addressZipCode':
        return value.replace(/(\d{5})(\d{3})/, '$1-$2');
      case 'admissionDate':
      case 'dateOfBirth':
        if (value.includes('T')) {
          return new Date(value).toLocaleDateString('pt-BR');
        }
        // Se já vier no formato AAAA-MM-DD, converte para DD/MM/AAAA
        const parts = value.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return value;
      default:
        return value;
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel de Funcionários</h1>
        <div className={styles.actions}>
          <button 
            className={styles.filterButton} 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> {showFilters ? 'Ocultar Filtros' : 'Exibir Filtros'}
          </button>
          <div className={styles.exportContainer}>
            <button 
              className={styles.exportButton} 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            >
              <FiDownload /> Exportar
            </button>
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
        {/* BUSCA RÁPIDA */}


        {/* ÁREA DE FILTROS DINÂMICA */}
        {showFilters && (
          <div className={styles.filtersWrapper}>
            <div className={styles.filtersHeader}>
              <h3>Filtros Avançados</h3>
              {isAnyFilterActive && (
                <button className={styles.clearFiltersButton} onClick={clearAllFilters}>
                  <FiX /> Limpar Filtros
                </button>
              )}
            </div>
            <div className={styles.filtersGrid}>
              {EMPLOYEE_FIELDS.map((field) => (
                <div key={field.name} className={styles.filterInputGroup}>
                  <label htmlFor={`filter-${field.name}`}>{field.label}</label>
                  <input
                    type="text"
                    id={`filter-${field.name}`}
                    placeholder={`Filtrar por ${field.label}...`}
                    className={styles.filterInput}
                    value={filters[field.name]}
                    onChange={(e) => handleFilterChange(field.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* TABELA COM SCROLL HORIZONTAL */}
        {isLoading ? (
          <div className={styles.loadingMessage}>
            <p>Carregando funcionários...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>
            <p style={{ color: 'red' }}>Erro: {error}</p>
            <button onClick={fetchFuncionarios} className={styles.retryButton}>
              Tentar Novamente
            </button>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {EMPLOYEE_FIELDS.map(field => (
                    <th key={field.name}>{field.label}</th>
                  ))}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFuncionarios.length > 0 ? (
                  filteredFuncionarios.map((func) => (
                    <tr key={func.id}>
                      {EMPLOYEE_FIELDS.map(field => (
                        <td key={`${func.id}-${field.name}`}>
                          {/* // <<-- 2. LÓGICA DO LINK APLICADA AQUI -->> */}
                          {field.name === 'fullName' ? (
                            <Link href={`/funcionarios/${func.id}`} className={styles.nameLink}>
                              {formatDisplayValue(func[field.name], field.name)}
                            </Link>
                          ) : (
                            formatDisplayValue(func[field.name], field.name)
                          )}
                        </td>
                      ))}
                      <td className={styles.actionsCell}>
                        <button 
                          onClick={() => handleOpenEditModal(func)} 
                          className={`${styles.actionIcon} ${styles.editButton}`} 
                          title="Editar"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(func.id, func.fullName)} 
                          className={`${styles.actionIcon} ${styles.deleteButton}`} 
                          title="Excluir"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={EMPLOYEE_FIELDS.length + 1} className={styles.noData}>
                      {isAnyFilterActive 
                        ? 'Nenhum funcionário encontrado com os filtros aplicados.' 
                        : 'Nenhum funcionário cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <footer className={styles.pagination}>
          <span>
            Exibindo {filteredFuncionarios.length} de {allFuncionarios.length} registros
            {isAnyFilterActive && ' (filtrados)'}
          </span>
        </footer>
      </div>

      {/* MODAL DE ADIÇÃO */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Cadastrar Novo Funcionário">
        <EmployeeForm 
          onSubmit={handleAddEmployeeSubmit} 
          onCancel={handleCloseAddModal} 
        />
      </Modal>

      {/* MODAL DE EDIÇÃO */}
      {editingEmployee && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Funcionário">
          <EmployeeForm 
            employeeData={mapApiDataToForm(editingEmployee)}
            onSubmit={handleEditEmployeeSubmit} 
            onCancel={handleCloseEditModal} 
            isEditing={true}
          />
        </Modal>
      )}
    </main>
  );
}