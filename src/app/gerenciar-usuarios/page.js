// app/gerenciar-usuarios/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './gerenciar.module.css';
import Modal from '../components/Modal/Modal';
import UserForm from '../components/UserForm/UserForm';
import { API_BASE_URL, getAuthHeaders } from '../../utils/api';

export default function GerenciarUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const router = useRouter();

  // Função para buscar usuários da API
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
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Cálculos da paginação (sem alteração)
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

  // Função de SUBMIT integrada com a API
  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingUser) {
        // Atualizando usuário existente (PUT)
        response = await fetch(`${API_BASE_URL}/admin-users/${editingUser.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: formData.name,
            login: formData.login,
            email: formData.email,
          }),
        });
      } else {
        // Criando novo usuário (POST)
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
      fetchUsuarios(); // Atualiza a lista
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  // Função de DELETE integrada com a API
  const handleDelete = async (id) => { 
    if (confirm('Tem certeza que deseja excluir este usuário?')) { 
      try {
        const response = await fetch(`${API_BASE_URL}/admin-users/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error('Falha ao excluir usuário.');
        
        fetchUsuarios(); // Atualiza a lista

        // Lógica de ajuste de página (sem alteração)
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
  
  // Renderização condicional
  if (isLoading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando usuários...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Erro: {error}</p>;

  return (
    <main className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Gerenciar Usuários</h1>
        <button className={styles.addUserBtn} onClick={handleOpenAddModal}>
          <FiPlus size={18} />
          <span>Adicionar Novo Usuário</span>
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Grid de Usuários (Mobile) */}
        <div className={styles.usersGrid}>
          {currentUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <div className={styles.userDetails}>
                  <h3 className={styles.userName}>{user.name}</h3> {/* Alterado para 'name' */}
                  <p className={styles.userLogin}>{user.login}</p>
                  <p className={styles.userEmail}>{user.email}</p>
                </div>
              </div>
              <div className={styles.userActions}>
                <button className={styles.editBtn} onClick={() => handleOpenEditModal(user)} title="Editar usuário"><FiEdit size={16} /></button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(user.id)} title="Excluir usuário"><FiTrash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Tabela (Desktop) */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell} style={{width: '35%'}}>Nome</div>
            <div className={styles.headerCell} style={{width: '45%'}}>E-mail</div>
            <div className={styles.headerCell} style={{width: '20%'}}>Ações</div>
          </div>
          <div className={styles.tableBody}>
            {currentUsers.map((user) => (
              <div key={user.id} className={styles.tableRow}>
                <div className={styles.tableCell} style={{width: '35%'}}>
                  <div className={styles.cellContent}>
                    <strong>{user.name}</strong> {/* Alterado para 'name' */}
                    <br />
                    <span className={styles.loginText}>{user.login}</span>
                  </div>
                </div>
                <div className={styles.tableCell} style={{width: '45%'}}>{user.email}</div>
                <div className={styles.tableCell} style={{width: '20%'}}>
                  <div className={styles.actionsContainer}>
                    <button className={styles.actionButton} onClick={() => handleOpenEditModal(user)} title="Editar usuário"><FiEdit size={16} /></button>
                    <button className={styles.actionButton} onClick={() => handleDelete(user.id)} title="Excluir usuário"><FiTrash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            {/* ... JSX da paginação sem alterações ... */}
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
        />
      </Modal>
    </main>
  );
}