// components/UserForm/UserForm.js
'use client';

import { useState, useEffect } from 'react';
import styles from './UserForm.module.css';

const permissionsMap = {
  gerenciarFuncionarios: 'Gerenciar Funcionários (Adicionar, Editar, Excluir)',
  gerenciarDocumentos: 'Gerenciar Documentos (Anexar, Excluir)',
  gerenciarUsuarios: 'Gerenciar Usuários (Adicionar, Editar, Excluir)',
  exportarDados: 'Exportar Relatórios (CSV, Excel, etc.)'
};

const UserForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', // Alterado de 'nome' para 'name'
    login: '',
    email: '',
    password: '', // Novo campo de senha
    permissions: {
      gerenciarFuncionarios: false,
      gerenciarDocumentos: false,
      gerenciarUsuarios: false,
      exportarDados: false,
    }
  });

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      const userPermissions = { ...formData.permissions, ...initialData.permissions };
      // Garante que o campo de nome seja mapeado corretamente
      setFormData({ ...initialData, name: initialData.name || initialData.nome, permissions: userPermissions, password: '' });
    } else {
        // Limpa o formulário para um novo cadastro
        setFormData({
            name: '', login: '', email: '', password: '',
            permissions: { gerenciarFuncionarios: false, gerenciarDocumentos: false, gerenciarUsuarios: false, exportarDados: false }
        });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [name]: checked }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Remove a senha do payload se não for um novo usuário e a senha não foi alterada
    const payload = { ...formData };
    if (isEditing && !payload.password) {
      delete payload.password;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Dados do Usuário</legend>
        <div className={styles.inputGroup}>
            <label htmlFor="name">Nome Completo</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className={styles.grid2Cols}>
            <div className={styles.inputGroup}><label htmlFor="login">Login</label><input type="text" id="login" name="login" value={formData.login} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label htmlFor="email">E-mail</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required /></div>
        </div>
        {!isEditing && ( // Mostra o campo de senha apenas ao criar um novo usuário
            <div className={styles.inputGroup} style={{marginTop: '1rem'}}>
                <label htmlFor="password">Senha</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
        )}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Permissões do Sistema (Visual)</legend>
        <p style={{fontSize: '0.8rem', color: '#666', marginBottom: '1rem'}}>Nota: As permissões são visuais e não estão integradas com a API nesta versão.</p>
        <div className={styles.permissionsGrid}>
            {Object.keys(permissionsMap).map(key => (
                 <div key={key} className={styles.checkboxGroup}>
                    <input type="checkbox" id={key} name={key} checked={formData.permissions[key]} onChange={handlePermissionChange} />
                    <label htmlFor={key}>{permissionsMap[key]}</label>
                 </div>
            ))}
        </div>
      </fieldset>
      
      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar</button>
      </div>
    </form>
  );
};

export default UserForm;