'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import styles from './gerenciar.module.css';
import Modal from '../components/Modal/Modal';
import UserForm from '../components/UserForm/UserForm';
import { API_BASE_URL, getAuthHeaders } from '../../utils/api';
import { useAuth } from '../context/AuthContext';

export default function GerenciarUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin-users`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (!response.ok) throw new Error('Falha ao buscar usuários.');
      
      const data = await response.json();
      setUsuarios(data.data.adminUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsuarios();
    }
  }, [fetchUsuarios, user]);

  const totalPages = Math.ceil(usuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = usuarios.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  const handleOpenAddModal = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleOpenEditModal = (usuario) => { setEditingUser(usuario); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingUser(null); };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingUser) {
        response = await fetch(`${API_BASE_URL}/admin-users/${editingUser.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/admin-users/register`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ocorreu um erro.');
      }
      
      handleCloseModal();
      fetchUsuarios();
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDelete = async (id) => { 
    if (confirm('Tem certeza que deseja excluir este usuário?')) { 
      try {
        const response = await fetch(`${API_BASE_URL}/admin-users/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || 'Falha ao excluir usuário.');
        }
        
        fetchUsuarios();

        const newTotal = usuarios.length - 1;
        const newTotalPages = Math.ceil(newTotal / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (err) {
        alert(`Erro: ${err.message}`);
      }
    }
  };
  
  if (isAuthLoading || isLoading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</p>;
  if (user?.role !== 'admin') return <p style={{ textAlign: 'center', padding: '2rem' }}>Acesso Negado.</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Erro: {error}</p>;

  const renderPermissionsSummary = (permissions) => {
    if (!permissions) return <span className={styles.permissionTag}>Nenhuma permissão específica</span>;
    const summary = [];
    if (permissions.employee?.create || permissions.employee?.edit || permissions.employee?.delete) summary.push('Funcionários');
    if (permissions.document?.create || permissions.document?.edit || permissions.document?.delete) summary.push('Documentos');
    if (permissions.annotation?.create || permissions.annotation?.edit || permissions.annotation?.delete) summary.push('Anotações');
    
    if (summary.length === 0) return <span className={styles.permissionTag}>Nenhuma permissão</span>;
    return summary.map(item => <span key={item} className={styles.permissionTag}>{item}</span>);
  };

  return (
    <main className={styles.pageContainer}>
      <div className={styles.pageHeaderActions}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <FiArrowLeft /> Voltar
        </button>
      </div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Gerenciar Usuários</h1>
        <button className={styles.addUserBtn} onClick={handleOpenAddModal}>
          <FiPlus size={18} /> Adicionar Novo Usuário
        </button>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell} style={{width: '25%'}}>Nome</div>
            <div className={styles.headerCell} style={{width: '25%'}}>E-mail</div>
            <div className={styles.headerCell} style={{width: '15%'}}>Perfil</div>
            <div className={styles.headerCell} style={{width: '25%'}}>Permissões (RH)</div>
            <div className={styles.headerCell} style={{width: '10%'}}>Ações</div>
          </div>
          <div className={styles.tableBody}>
            {currentUsers.map((u) => (
              <div key={u.id} className={styles.tableRow}>
                <div className={styles.tableCell} style={{width: '25%'}}>
                  <div className={styles.cellContent}>
                    <strong>{u.name}</strong><br />
                    <span className={styles.loginText}>{u.login}</span>
                    <span className={`${styles.statusBadge} ${u.isActive ? styles.statusAtivo : styles.statusInativo}`}>
                      {u.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div className={styles.tableCell} style={{width: '25%'}}>{u.email}</div>
                <div className={styles.tableCell} style={{width: '15%'}}>{u.role === 'admin' ? 'Admin' : 'RH'}</div>
                <div className={styles.tableCell} style={{width: '25%'}}>
                  <div className={styles.permissionsContainer}>
                    {u.role === 'rh' ? renderPermissionsSummary(u.permissions) : 'Acesso total'}
                  </div>
                </div>
                <div className={styles.tableCell} style={{width: '10%'}}>
                  <div className={styles.actionsContainer}>
                    <button className={styles.actionButton} onClick={() => handleOpenEditModal(u)} title="Editar"><FiEdit size={16} /></button>
                    {/* Não permite que o usuário se auto-exclua */}
                    {user?.id !== u.id && (
                        <button className={styles.actionButton} onClick={() => handleDelete(u.id)} title="Excluir"><FiTrash2 size={16} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <span className={styles.paginationInfo}>Página {currentPage} de {totalPages}</span>
            <div className={styles.paginationControls}>
              <button onClick={goToPrevious} disabled={currentPage === 1} className={styles.pageButton}><FiChevronLeft /></button>
              <span className={`${styles.pageNumber} ${styles.pageNumberActive}`}>{currentPage}</span>
              <button onClick={goToNext} disabled={currentPage === totalPages} className={styles.pageButton}><FiChevronRight /></button>
            </div>
          </div>
        )}
      </div>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}>
        <UserForm 
          initialData={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          // ==========================================================
          // CORREÇÃO APLICADA AQUI: Passando o usuário logado para o form
          // ==========================================================
          currentUser={user}
        />
      </Modal>
    </main>
  );
}