'use client';

import { useState, useEffect } from 'react';
import styles from './UserForm.module.css';

const permissionMatrix = {
  employee: {
    label: 'Funcionários',
    actions: { create: 'Criar', edit: 'Editar', delete: 'Excluir' }
  },
  document: {
    label: 'Documentos',
    actions: { create: 'Criar', edit: 'Editar', delete: 'Excluir' }
  },
  annotation: {
    label: 'Anotações',
    actions: { create: 'Criar', edit: 'Editar', delete: 'Excluir' }
  }
};

const UserForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    email: '',
    password: '',
    role: 'rh',
    isActive: true,
    permissions: {
      employee: { create: false, edit: false, delete: false },
      document: { create: false, edit: false, delete: false },
      annotation: { create: false, edit: false, delete: false },
    }
  });

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      // Combina as permissões default com as existentes para evitar erros
      const initialPermissions = {
        employee: { ...formData.permissions.employee, ...initialData.permissions?.employee },
        document: { ...formData.permissions.document, ...initialData.permissions?.document },
        annotation: { ...formData.permissions.annotation, ...initialData.permissions?.annotation },
      };
      
      setFormData({
        name: initialData.name || '',
        login: initialData.login || '',
        email: initialData.email || '',
        password: '',
        role: initialData.role || 'rh',
        isActive: initialData.isActive,
        permissions: initialPermissions,
      });
    } else {
      // Reseta para um formulário limpo
      setFormData({
        name: '', login: '', email: '', password: '', role: 'rh', isActive: true,
        permissions: {
          employee: { create: false, edit: false, delete: false },
          document: { create: false, edit: false, delete: false },
          annotation: { create: false, edit: false, delete: false },
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    const [entity, action] = name.split('-');
    
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [entity]: {
          ...prev.permissions[entity],
          [action]: checked
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (isEditing && !payload.password) delete payload.password;
    if (payload.role === 'admin') delete payload.permissions; // Limpa permissões se for admin
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
          <div className={styles.inputGroup}>
            <label htmlFor="login">Login</label>
            <input type="text" id="login" name="login" value={formData.login} onChange={handleChange} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
        </div>
        <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
          <label htmlFor="password">{isEditing ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha'}</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required={!isEditing} />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Perfil e Status</legend>
        <div className={styles.grid2Cols}>
          <div className={styles.inputGroup}>
            <label htmlFor="role">Perfil de Acesso</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="rh">RH (Permissões Customizadas)</option>
              <option value="admin">Admin (Acesso Total)</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="isActive">Status da Conta</label>
            <select id="isActive" name="isActive" value={String(formData.isActive)} onChange={(e) => setFormData(p => ({...p, isActive: e.target.value === 'true'}))}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>
      </fieldset>

      {formData.role === 'rh' && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Permissões Granulares (para Perfil RH)</legend>
          <div className={styles.permissionsContainer}>
            {Object.entries(permissionMatrix).map(([entity, config]) => (
              <div key={entity} className={styles.permissionEntity}>
                <strong>{config.label}</strong>
                <div className={styles.permissionActions}>
                  {Object.entries(config.actions).map(([action, label]) => (
                    <div key={action} className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id={`${entity}-${action}`}
                        name={`${entity}-${action}`}
                        checked={!!formData.permissions?.[entity]?.[action]}
                        onChange={handlePermissionChange}
                      />
                      <label htmlFor={`${entity}-${action}`}>{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar</button>
      </div>
    </form>
  );
};

export default UserForm;