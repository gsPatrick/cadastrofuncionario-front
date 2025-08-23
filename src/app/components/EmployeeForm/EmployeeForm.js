// components/EmployeeForm/EmployeeForm.js
'use client';

import { useState, useEffect } from 'react';
import styles from './EmployeeForm.module.css';

const EmployeeForm = ({ employeeData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: '',
    dataNascimento: '',
    sexo: '',
    estadoCivil: '',
    cpf: '',
    rg: '',
    orgaoExpedidor: '',
    
    // Contato
    telefone: '',
    telefoneEmergencia: '',
    emailPessoal: '',
    emailInstitucional: '',

    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',

    // Dados Funcionais
    matricula: '',
    dataAdmissao: '',
    cargo: '',
    funcao: '',
    setor: '',
    lotacaoAtual: '',
    vinculoInstitucional: '',
    situacaoFuncional: 'Ativo',

    // Outros
    observacoes: ''
  });

  useEffect(() => {
    if (employeeData) {
      // Mapeia os dados existentes para o formulário, garantindo que campos nulos se tornem strings vazias
      const fields = Object.keys(formData);
      const updatedFormData = {};
      fields.forEach(field => {
        updatedFormData[field] = employeeData[field] || '';
      });
      setFormData(updatedFormData);
    } else {
      // Limpa o formulário para um novo cadastro
      const fields = Object.keys(formData);
      const clearedFormData = {};
      fields.forEach(field => {
        clearedFormData[field] = '';
      });
      setFormData({...clearedFormData, situacaoFuncional: 'Ativo'}); // Define um valor padrão
    }
  }, [employeeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* --- DADOS PESSOAIS --- */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Dados Pessoais</legend>
        <div className={styles.inputGroup}><label htmlFor="nome">Nome Completo *</label><input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required /></div>
        <div className={styles.grid3Cols}>
          <div className={styles.inputGroup}><label htmlFor="dataNascimento">Data de Nascimento</label><input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} /></div>
          <div className={styles.inputGroup}><label htmlFor="sexo">Sexo</label><select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange}><option value="">Selecione...</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option></select></div>
          <div className={styles.inputGroup}><label htmlFor="estadoCivil">Estado Civil</label><select id="estadoCivil" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange}><option value="">Selecione...</option><option value="Solteiro(a)">Solteiro(a)</option><option value="Casado(a)">Casado(a)</option><option value="Divorciado(a)">Divorciado(a)</option><option value="Viúvo(a)">Viúvo(a)</option></select></div>
        </div>
        <div className={styles.grid3Cols}>
          <div className={styles.inputGroup}><label htmlFor="cpf">CPF</label><input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} /></div>
          <div className={styles.inputGroup}><label htmlFor="rg">RG</label><input type="text" id="rg" name="rg" value={formData.rg} onChange={handleChange} /></div>
          <div className={styles.inputGroup}><label htmlFor="orgaoExpedidor">Órgão Exp.</label><input type="text" id="orgaoExpedidor" name="orgaoExpedidor" value={formData.orgaoExpedidor} onChange={handleChange} /></div>
        </div>
      </fieldset>

      {/* --- CONTATO --- */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Contato</legend>
        <div className={styles.grid2Cols}>
          <div className={styles.inputGroup}><label htmlFor="telefone">Telefone Celular</label><input type="tel" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} /></div>
          <div className={styles.inputGroup}><label htmlFor="telefoneEmergencia">Telefone de Emergência</label><input type="tel" id="telefoneEmergencia" name="telefoneEmergencia" value={formData.telefoneEmergencia} onChange={handleChange} /></div>
          <div className={styles.inputGroup}><label htmlFor="emailPessoal">E-mail Pessoal</label><input type="email" id="emailPessoal" name="emailPessoal" value={formData.emailPessoal} onChange={handleChange} /></div>
          <div className={styles.inputGroup}><label htmlFor="emailInstitucional">E-mail Institucional</label><input type="email" id="emailInstitucional" name="emailInstitucional" value={formData.emailInstitucional} onChange={handleChange} /></div>
        </div>
      </fieldset>
      
      {/* --- ENDEREÇO --- */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Endereço</legend>
        <div className={styles.grid3Cols}>
          <div className={styles.inputGroup}><label htmlFor="cep">CEP</label><input type="text" id="cep" name="cep" value={formData.cep} onChange={handleChange} /></div>
          <div className={styles.inputGroup} style={{gridColumn: 'span 2'}}><label htmlFor="logradouro">Logradouro</label><input type="text" id="logradouro" name="logradouro" value={formData.logradouro} onChange={handleChange} /></div>
        </div>
        <div className={styles.grid3Cols}>
            <div className={styles.inputGroup}><label htmlFor="numero">Número</label><input type="text" id="numero" name="numero" value={formData.numero} onChange={handleChange} /></div>
            <div className={styles.inputGroup}><label htmlFor="complemento">Complemento</label><input type="text" id="complemento" name="complemento" value={formData.complemento} onChange={handleChange} /></div>
            <div className={styles.inputGroup}><label htmlFor="bairro">Bairro</label><input type="text" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} /></div>
        </div>
         <div className={styles.grid2Cols}>
            <div className={styles.inputGroup}><label htmlFor="cidade">Cidade</label><input type="text" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} /></div>
            <div className={styles.inputGroup}><label htmlFor="estado">Estado</label><input type="text" id="estado" name="estado" value={formData.estado} onChange={handleChange} /></div>
        </div>
      </fieldset>

      {/* --- DADOS FUNCIONAIS --- */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Dados Funcionais</legend>
        <div className={styles.grid2Cols}>
          <div className={styles.inputGroup}><label htmlFor="matricula">Matrícula *</label><input type="text" id="matricula" name="matricula" value={formData.matricula} onChange={handleChange} required /></div>
          <div className={styles.inputGroup}><label htmlFor="dataAdmissao">Data de Admissão</label><input type="date" id="dataAdmissao" name="dataAdmissao" value={formData.dataAdmissao} onChange={handleChange} /></div>
        </div>
        <div className={styles.grid3Cols}>
          <div className={styles.inputGroup}><label htmlFor="cargo">Cargo *</label><input type="text" id="cargo" name="cargo" value={formData.cargo} onChange={handleChange} required /></div>
          <div className={styles.inputGroup}><label htmlFor="funcao">Função</label><input type="text" id="funcao" name="funcao" value={formData.funcao} onChange={handleChange} /></div>
          <div className={styles.inputGroup}><label htmlFor="setor">Setor/Departamento *</label><input type="text" id="setor" name="setor" value={formData.setor} onChange={handleChange} required /></div>
        </div>
        <div className={styles.grid2Cols}>
          <div className={styles.inputGroup}><label htmlFor="vinculoInstitucional">Vínculo Institucional</label><select id="vinculoInstitucional" name="vinculoInstitucional" value={formData.vinculoInstitucional} onChange={handleChange}><option value="">Selecione...</option><option value="Efetivo">Efetivo</option><option value="Comissionado">Comissionado</option><option value="Estagiário">Estagiário</option><option value="Terceirizado">Terceirizado</option></select></div>
          <div className={styles.inputGroup}><label htmlFor="situacaoFuncional">Situação Funcional</label><select id="situacaoFuncional" name="situacaoFuncional" value={formData.situacaoFuncional} onChange={handleChange}><option value="Ativo">Ativo</option><option value="Afastado">Afastado</option><option value="Licença">Licença</option><option value="Férias">Férias</option></select></div>
        </div>
      </fieldset>

      {/* --- OBSERVAÇÕES --- */}
       <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Observações</legend>
        <div className={styles.inputGroup}><label htmlFor="observacoes">Observações Gerais</label><textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} rows="4" /></div>
      </fieldset>

      {/* --- BOTÕES --- */}
      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar</button>
      </div>
    </form>
  );
};

export default EmployeeForm;