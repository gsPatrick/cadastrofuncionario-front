'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiDownload, FiFilter, FiX, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import styles from './dashboard.module.css';
import { API_BASE_URL, getAuthHeaders } from '../../utils/api';
import { useAuth } from '../context/AuthContext'; // 1. IMPORTAR O CONTEXTO DE AUTENTICAÇÃO

// Componentes
import Modal from '../components/Modal/Modal';
import EmployeeForm from '../components/EmployeeForm/EmployeeForm';
import Spinner from '../components/Spinner/Spinner';

// Constante com todos os 25 campos para gerar filtros e a tabela dinamicamente
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

const initialFiltersState = EMPLOYEE_FIELDS.reduce((acc, field) => {
  acc[field.name] = '';
  return acc;
}, {});

export default function DashboardPage() {
  const [allFuncionarios, setAllFuncionarios] = useState([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, hasPermission } = useAuth(); // 2. OBTER USUÁRIO E FUNÇÃO 'hasPermission' DO CONTEXTO

  const [filters, setFilters] = useState(initialFiltersState);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

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
      setFilteredFuncionarios(data.data.employees);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  useEffect(() => {
    let result = [...allFuncionarios];
    if (searchTerm) {
      result = result.filter((employee) =>
        Object.values(employee).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((employee) =>
          employee[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    setFilteredFuncionarios(result);
  }, [filters, allFuncionarios, searchTerm]);

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
  
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  
  const handleAddEmployeeSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar funcionário.');
      }
      
      handleCloseAddModal();
      await fetchFuncionarios();
      alert('Funcionário cadastrado com sucesso!');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleOpenEditModal = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };
  
  const handleEditEmployeeSubmit = async (formData) => {
    if (!editingEmployee) return;
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar funcionário.');
      }
      
      handleCloseEditModal();
      await fetchFuncionarios();
      alert('Funcionário atualizado com sucesso!');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDelete = async (id, employeeName = '') => {
    if (window.confirm(`Confirma a exclusão do funcionário "${employeeName}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao excluir funcionário.');
        }
        
        await fetchFuncionarios();
        alert('Funcionário excluído com sucesso!');
      } catch (err) {
        alert(`Erro: ${err.message}`);
      }
    }
  };

  const handleExport = async (format) => {
    setIsExportMenuOpen(false);
    const getFileExtension = (fmt) => fmt === 'excel' ? 'xlsx' : fmt;
    
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
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
      a.download = `funcionarios_${new Date().toISOString().split('T')[0]}.${getFileExtension(format)}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Erro ao exportar: ${err.message}`);
    }
  };

  const formatDisplayValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
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
          
          {/* 3. VERIFICAR PERMISSÃO PARA EXPORTAR */}
          {hasPermission('employee:edit') && (
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
          )}

          {/* 4. VERIFICAR PERMISSÃO PARA ADICIONAR */}
          {hasPermission('employee:create') && (
            <button className={styles.addButton} onClick={handleOpenAddModal}>
              <FiPlus /> Adicionar Funcionário
            </button>
          )}
        </div>
      </header>

      <div className={styles.contentCard}>
        <div className={styles.searchWrapper}>
             <FiSearch className={styles.searchIcon} />
             <input
               type="text"
               placeholder="Busca rápida por nome, matrícula, cargo, CPF..."
               className={styles.searchInput}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>

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
        
        {isLoading ? (
          <div className={styles.noData}>
            <Spinner size="large" color="var(--cor-azul-escuro)" />
            <p>Carregando funcionários...</p>
          </div>
        ) : error ? (
          <div className={`${styles.noData} ${styles.errorText}`}>
            <p>Erro: {error}</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {EMPLOYEE_FIELDS.map(field => <th key={field.name}>{field.label}</th>)}
                  {/* 5. MOSTRAR CABEÇALHO DE AÇÕES APENAS SE TIVER ALGUMA PERMISSÃO DE AÇÃO */}
                  {(hasPermission('employee:edit') || hasPermission('employee:delete')) && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filteredFuncionarios.length > 0 ? (
                  filteredFuncionarios.map((func) => (
                    <tr key={func.id}>
                      {EMPLOYEE_FIELDS.map(field => (
                        <td key={`${func.id}-${field.name}`}>
                          {field.name === 'fullName' ? (
                            <Link href={`/funcionarios/${func.id}`} className={styles.nameLink}>
                              {formatDisplayValue(func[field.name])}
                            </Link>
                          ) : (
                            formatDisplayValue(func[field.name])
                          )}
                        </td>
                      ))}
                      
                      {/* 6. RENDERIZAR CÉLULA DE AÇÕES CONDICIONALMENTE */}
                      {(hasPermission('employee:edit') || hasPermission('employee:delete')) && (
                        <td className={styles.actionsCell}>
                          {hasPermission('employee:edit') && (
                            <button 
                              onClick={() => handleOpenEditModal(func)} 
                              className={styles.actionIcon}
                              title="Editar"
                            >
                              <FiEdit />
                            </button>
                          )}
                          {hasPermission('employee:delete') && (
                            <button 
                              onClick={() => handleDelete(func.id, func.fullName)} 
                              className={styles.actionIcon}
                              title="Excluir"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={EMPLOYEE_FIELDS.length + 1} className={styles.noData}>
                      {isAnyFilterActive ? 'Nenhum funcionário encontrado.' : 'Nenhum funcionário cadastrado.'}
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

      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Cadastrar Novo Funcionário">
        <EmployeeForm onSubmit={handleAddEmployeeSubmit} onCancel={handleCloseAddModal} />
      </Modal>

      {editingEmployee && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Funcionário">
          <EmployeeForm 
            employeeData={editingEmployee}
            onSubmit={handleEditEmployeeSubmit} 
            onCancel={handleCloseEditModal} 
            isEditing={true}
          />
        </Modal>
      )}
    </main>
  );
}