// app/dashboard/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiDownload, FiFilter, FiX } from 'react-icons/fi';
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

  // Estados dos modais e exportação
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // 1. Busca os dados da API apenas uma vez (ou quando necessário)
  useEffect(() => {
    const fetchFuncionarios = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/employees`, { headers: getAuthHeaders() });
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (!response.ok) throw new Error('Falha ao buscar dados dos funcionários.');
        
        const data = await response.json();
        setAllFuncionarios(data.data.employees);
        setFilteredFuncionarios(data.data.employees); // Inicialmente, a lista filtrada é igual à completa
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFuncionarios();
  }, [router]);

  // 2. Efeito para aplicar filtros no CLIENT-SIDE sempre que o objeto 'filters' mudar
  useEffect(() => {
    let result = [...allFuncionarios];

    // Itera sobre cada filtro ativo e aplica-o à lista de funcionários
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((employee) =>
          employee[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    setFilteredFuncionarios(result);
  }, [filters, allFuncionarios]);

  // Handler para atualizar o estado dos filtros
  const handleFilterChange = (fieldName, value) => {
    setFilters(prev => ({ ...prev, [fieldName]: value }));
  };
  
  const clearAllFilters = () => {
    setFilters(initialFiltersState);
  };
  
  const isAnyFilterActive = useMemo(() => Object.values(filters).some(v => v !== ''), [filters]);


  // Funções de CRUD (sem alterações, continuam funcionando com a API)
  const mapFormDataToApi = (formData) => ({ /* ... (Função mantida como antes) ... */ });
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleAddEmployeeSubmit = async (formData) => { /* ... */ };
  const handleOpenEditModal = (employee) => { setEditingEmployee(employee); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditingEmployee(null); };
  const handleEditEmployeeSubmit = async (formData) => { /* ... */ };
  const handleDelete = async (id) => { /* ... */ };
  const handleExport = async (format) => { /* ... */ };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel de Funcionários</h1>
        <div className={styles.actions}>
          <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> {showFilters ? 'Ocultar Filtros' : 'Exibir Filtros'}
          </button>
          <div className={styles.exportContainer}>
            <button className={styles.exportButton} onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}><FiDownload /> Exportar</button>
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
        {/* NOVA ÁREA DE FILTROS DINÂMICA */}
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
        
        {/* NOVA TABELA COM SCROLL HORIZONTAL */}
        {isLoading ? (
          <p>Carregando funcionários...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {EMPLOYEE_FIELDS.map(field => <th key={field.name}>{field.label}</th>)}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFuncionarios.length > 0 ? (
                  filteredFuncionarios.map((func) => (
                    <tr key={func.id}>
                      {EMPLOYEE_FIELDS.map(field => (
                        <td key={`${func.id}-${field.name}`}>{func[field.name] || '-'}</td>
                      ))}
                      <td className={styles.actionsCell}>
                        <button onClick={() => handleOpenEditModal(func)} className={styles.actionIcon} title="Editar"><FiEdit /></button>
                        <button onClick={() => handleDelete(func.id)} className={styles.actionIcon} title="Excluir"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={EMPLOYEE_FIELDS.length + 1} className={styles.noData}>
                      Nenhum funcionário encontrado com os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <footer className={styles.pagination}>
          <span>Exibindo {filteredFuncionarios.length} de {allFuncionarios.length} registros</span>
        </footer>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Cadastrar Novo Funcionário">
        <EmployeeForm onSubmit={handleAddEmployeeSubmit} onCancel={handleCloseAddModal} />
      </Modal>

      {editingEmployee && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Funcionário">
          <EmployeeForm employeeData={editingEmployee} onSubmit={handleEditEmployeeSubmit} onCancel={handleCloseEditModal} />
        </Modal>
      )}
    </main>
  );
}