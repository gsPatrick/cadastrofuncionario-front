// components/EmployeeForm/EmployeeForm.js
'use client';

import { useState, useEffect } from 'react';
import styles from './EmployeeForm.module.css';
import Spinner from '../Spinner/Spinner';

const EmployeeForm = ({ employeeData = null, onSubmit, onCancel, isEditing = false }) => {
  // Estado inicial expandido para incluir os novos campos
  const initialFormState = {
    fullName: '', dateOfBirth: '', gender: '', maritalStatus: '', cpf: '', rg: '', rgIssuer: '',
    hasChildren: false, numberOfChildren: 0,
    educationLevel: '', educationArea: '',
    comorbidity: '', disability: '', bloodType: '',
    mobilePhone1: '', mobilePhone2: '', emergencyContactPhone: '',
    personalEmail: '', institutionalEmail: '', addressZipCode: '', addressStreet: '', addressNumber: '',
    addressComplement: '', addressNeighborhood: '', addressCity: '', addressState: '',
    registrationNumber: '', admissionDate: '', position: '', role: '', department: '',
    currentAssignment: '', institutionalLink: '', functionalStatus: 'Ativo', generalObservations: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Estado para armazenar os erros de validação
  const [errors, setErrors] = useState({});
  
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  useEffect(() => {
    if (isEditing && employeeData) {
      const populatedState = {};
      // Popula o estado com os dados existentes, garantindo que todos os campos do estado inicial sejam preenchidos
      Object.keys(initialFormState).forEach(key => {
        populatedState[key] = employeeData[key] ?? initialFormState[key];
      });
      setFormData(populatedState);
    } else {
      // Reseta para o estado inicial para um novo cadastro
      setFormData(initialFormState);
    }
    setErrors({}); // Limpa os erros ao carregar o formulário
  }, [employeeData, isEditing]);
  
  // Função de validação (sem alterações, pois os novos campos não são obrigatórios)
  const validate = (data) => {
    const newErrors = {};

    // Dados Pessoais
    if (!data.fullName) newErrors.fullName = "Nome completo é obrigatório.";
    if (!data.dateOfBirth) newErrors.dateOfBirth = "Data de nascimento é obrigatória.";
    if (!data.gender) newErrors.gender = "Gênero é obrigatório.";
    if (!data.maritalStatus) newErrors.maritalStatus = "Estado civil é obrigatório.";
    if (!data.cpf) newErrors.cpf = "CPF é obrigatório.";
    if (!data.rg) newErrors.rg = "RG é obrigatório.";

    // Contato
    if (!data.mobilePhone1) newErrors.mobilePhone1 = "Telefone celular é obrigatório.";
    if (!data.emergencyContactPhone) newErrors.emergencyContactPhone = "Telefone de emergência é obrigatório.";
    if (!data.institutionalEmail) newErrors.institutionalEmail = "E-mail institucional é obrigatório.";
    else if (!/\S+@\S+\.\S+/.test(data.institutionalEmail)) newErrors.institutionalEmail = "E-mail institucional inválido.";

    // Endereço
    if (!data.addressZipCode) newErrors.addressZipCode = "CEP é obrigatório.";
    if (!data.addressStreet) newErrors.addressStreet = "Logradouro é obrigatório.";
    if (!data.addressNumber) newErrors.addressNumber = "Número é obrigatório.";
    if (!data.addressNeighborhood) newErrors.addressNeighborhood = "Bairro é obrigatório.";
    if (!data.addressCity) newErrors.addressCity = "Cidade é obrigatória.";
    if (!data.addressState) newErrors.addressState = "Estado (UF) é obrigatório.";

    // Dados Funcionais
    if (!data.registrationNumber) newErrors.registrationNumber = "Matrícula é obrigatória.";
    if (!data.admissionDate) newErrors.admissionDate = "Data de admissão é obrigatória.";
    if (!data.position) newErrors.position = "Cargo é obrigatório.";
    if (!data.department) newErrors.department = "Setor/Departamento é obrigatório.";
    if (!data.institutionalLink) newErrors.institutionalLink = "Vínculo institucional é obrigatório.";
    if (!data.functionalStatus) newErrors.functionalStatus = "Situação funcional é obrigatória.";
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      setCepError('');
      return;
    }

    setIsCepLoading(true);
    setCepError('');
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      if (!response.ok) throw new Error('CEP não encontrado ou inválido.');
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        addressStreet: data.street,
        addressNeighborhood: data.neighborhood,
        addressCity: data.city,
        addressState: data.state,
      }));
      setErrors(prev => ({ ...prev, addressStreet: null, addressNeighborhood: null, addressCity: null, addressState: null }));
    } catch (error) {
      setCepError(error.message);
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* --- DADOS PESSOAIS --- */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Dados Pessoais</legend>
        <div className={styles.inputGroup}><label htmlFor="fullName">Nome Completo <span className={styles.required}>*</span></label><input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className={errors.fullName ? styles.inputError : ''} /><p className={styles.errorText}>{errors.fullName}</p></div>
        <div className={styles.grid3Cols}>
          <div className={styles.inputGroup}><label htmlFor="dateOfBirth">Data de Nascimento <span className={styles.required}>*</span></label><input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={errors.dateOfBirth ? styles.inputError : ''} /><p className={styles.errorText}>{errors.dateOfBirth}</p></div>
          <div className={styles.inputGroup}><label htmlFor="gender">Gênero <span className={styles.required}>*</span></label><select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={errors.gender ? styles.inputError : ''}><option value="">Selecione...</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option><option value="Não Informado">Não Informado</option></select><p className={styles.errorText}>{errors.gender}</p></div>
          <div className={styles.inputGroup}><label htmlFor="maritalStatus">Estado Civil <span className={styles.required}>*</span></label><select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={errors.maritalStatus ? styles.inputError : ''}><option value="">Selecione...</option><option value="Solteiro(a)">Solteiro(a)</option><option value="Casado(a)">Casado(a)</option><option value="Divorciado(a)">Divorciado(a)</option><option value="Viúvo(a)">Viúvo(a)</option><option value="União Estável">União Estável</option></select><p className={styles.errorText}>{errors.maritalStatus}</p></div>
        </div>
        <div className={styles.grid3Cols}>
          <div className={styles.inputGroup}><label htmlFor="cpf">CPF <span className={styles.required}>*</span></label><input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} className={errors.cpf ? styles.inputError : ''} /><p className={styles.errorText}>{errors.cpf}</p></div>
          <div className={styles.inputGroup}><label htmlFor="rg">RG <span className={styles.required}>*</span></label><input type="text" id="rg" name="rg" value={formData.rg} onChange={handleChange} className={errors.rg ? styles.inputError : ''} /><p className={styles.errorText}>{errors.rg}</p></div>
          <div className={styles.inputGroup}><label htmlFor="rgIssuer">Órgão Exp.</label><input type="text" id="rgIssuer" name="rgIssuer" value={formData.rgIssuer} onChange={handleChange} /></div>
        </div>
        <div className={styles.grid2Cols}><div className={styles.checkboxGroup}><input type="checkbox" id="hasChildren" name="hasChildren" checked={formData.hasChildren} onChange={handleChange} /><label htmlFor="hasChildren">Possui Filhos?</label></div>{formData.hasChildren && <div className={styles.inputGroup}><label htmlFor="numberOfChildren">Quantos?</label><input type="number" id="numberOfChildren" name="numberOfChildren" value={formData.numberOfChildren} onChange={handleChange} min="0" /></div>}</div>
      </fieldset>

      {/* --- NOVA SEÇÃO DE INFORMAÇÕES ADICIONAIS --- */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Informações Adicionais</legend>
        <div className={styles.grid2Cols}>
          <div className={styles.inputGroup}>
            <label htmlFor="educationLevel">Nível de Formação</label>
            <input type="text" id="educationLevel" name="educationLevel" value={formData.educationLevel} onChange={handleChange} placeholder="Ex: Superior Completo"/>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="educationArea">Área de Formação/Titulação</label>
            <input type="text" id="educationArea" name="educationArea" value={formData.educationArea} onChange={handleChange} placeholder="Ex: Análise de Sistemas"/>
          </div>
        </div>
        <div className={styles.grid3Cols}>
          <div className={styles.inputGroup}>
            <label htmlFor="bloodType">Tipo Sanguíneo</label>
            <input type="text" id="bloodType" name="bloodType" value={formData.bloodType} onChange={handleChange} placeholder="Ex: A+"/>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="comorbidity">Comorbidade</label>
            <input type="text" id="comorbidity" name="comorbidity" value={formData.comorbidity} onChange={handleChange} placeholder="Se houver, descreva"/>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="disability">Deficiência</label>
            <input type="text" id="disability" name="disability" value={formData.disability} onChange={handleChange} placeholder="Se houver, descreva"/>
          </div>
        </div>
      </fieldset>

      {/* --- SEÇÃO DE CONTATO --- */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Contato</legend>
        <div className={styles.grid2Cols}>
          <div className={styles.inputGroup}><label htmlFor="mobilePhone1">Telefone Celular 1 <span className={styles.required}>*</span></label><input type="tel" id="mobilePhone1" name="mobilePhone1" value={formData.mobilePhone1} onChange={handleChange} className={errors.mobilePhone1 ? styles.inputError : ''} /><p className={styles.errorText}>{errors.mobilePhone1}</p></div>
          <div className={styles.inputGroup}><label htmlFor="mobilePhone2">Telefone Celular 2</label><input type="tel" id="mobilePhone2" name="mobilePhone2" value={formData.mobilePhone2} onChange={handleChange} /></div>
          <div className={styles.inputGroup}><label htmlFor="emergencyContactPhone">Telefone de Emergência <span className={styles.required}>*</span></label><input type="tel" id="emergencyContactPhone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className={errors.emergencyContactPhone ? styles.inputError : ''} /><p className={styles.errorText}>{errors.emergencyContactPhone}</p></div>
          <div className={styles.inputGroup}><label htmlFor="institutionalEmail">E-mail Institucional <span className={styles.required}>*</span></label><input type="email" id="institutionalEmail" name="institutionalEmail" value={formData.institutionalEmail} onChange={handleChange} className={errors.institutionalEmail ? styles.inputError : ''} /><p className={styles.errorText}>{errors.institutionalEmail}</p></div>
          <div className={styles.inputGroup}><label htmlFor="personalEmail">E-mail Pessoal</label><input type="email" id="personalEmail" name="personalEmail" value={formData.personalEmail} onChange={handleChange} /></div>
        </div>
      </fieldset>
      
      {/* --- SEÇÃO DE ENDEREÇO --- */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Endereço</legend>
        <div className={styles.grid3Cols}>
          <div className={styles.inputGroup}><label htmlFor="addressZipCode">CEP <span className={styles.required}>*</span></label><div className={styles.cepContainer}><input type="text" id="addressZipCode" name="addressZipCode" value={formData.addressZipCode} onChange={handleChange} onBlur={handleCepBlur} className={errors.addressZipCode ? styles.inputError : ''} />{isCepLoading && <Spinner size="small" color="var(--cor-azul-claro)" />}</div>{cepError && <span className={styles.cepError}>{cepError}</span>}<p className={styles.errorText}>{errors.addressZipCode}</p></div>
          <div className={styles.inputGroup} style={{gridColumn: 'span 2'}}><label htmlFor="addressStreet">Logradouro <span className={styles.required}>*</span></label><input type="text" id="addressStreet" name="addressStreet" value={formData.addressStreet} onChange={handleChange} className={errors.addressStreet ? styles.inputError : ''} /><p className={styles.errorText}>{errors.addressStreet}</p></div>
        </div>
        <div className={styles.grid3Cols}>
            <div className={styles.inputGroup}><label htmlFor="addressNumber">Número <span className={styles.required}>*</span></label><input type="text" id="addressNumber" name="addressNumber" value={formData.addressNumber} onChange={handleChange} className={errors.addressNumber ? styles.inputError : ''} /><p className={styles.errorText}>{errors.addressNumber}</p></div>
            <div className={styles.inputGroup}><label htmlFor="addressComplement">Complemento</label><input type="text" id="addressComplement" name="addressComplement" value={formData.addressComplement} onChange={handleChange} /></div>
            <div className={styles.inputGroup}><label htmlFor="addressNeighborhood">Bairro <span className={styles.required}>*</span></label><input type="text" id="addressNeighborhood" name="addressNeighborhood" value={formData.addressNeighborhood} onChange={handleChange} className={errors.addressNeighborhood ? styles.inputError : ''} /><p className={styles.errorText}>{errors.addressNeighborhood}</p></div>
        </div>
         <div className={styles.grid2Cols}>
            <div className={styles.inputGroup}><label htmlFor="addressCity">Cidade <span className={styles.required}>*</span></label><input type="text" id="addressCity" name="addressCity" value={formData.addressCity} onChange={handleChange} className={errors.addressCity ? styles.inputError : ''} /><p className={styles.errorText}>{errors.addressCity}</p></div>
            <div className={styles.inputGroup}><label htmlFor="addressState">Estado <span className={styles.required}>*</span></label><input type="text" id="addressState" name="addressState" value={formData.addressState} onChange={handleChange} maxLength="2" className={errors.addressState ? styles.inputError : ''} /><p className={styles.errorText}>{errors.addressState}</p></div>
        </div>
      </fieldset>

      {/* --- DADOS FUNCIONAIS --- */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Dados Funcionais</legend>
        <div className={styles.grid2Cols}><div className={styles.inputGroup}><label htmlFor="registrationNumber">Matrícula <span className={styles.required}>*</span></label><input type="text" id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className={errors.registrationNumber ? styles.inputError : ''} /><p className={styles.errorText}>{errors.registrationNumber}</p></div><div className={styles.inputGroup}><label htmlFor="admissionDate">Data de Admissão <span className={styles.required}>*</span></label><input type="date" id="admissionDate" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className={errors.admissionDate ? styles.inputError : ''} /><p className={styles.errorText}>{errors.admissionDate}</p></div></div>
        <div className={styles.grid3Cols}><div className={styles.inputGroup}><label htmlFor="position">Cargo <span className={styles.required}>*</span></label><input type="text" id="position" name="position" value={formData.position} onChange={handleChange} className={errors.position ? styles.inputError : ''} /><p className={styles.errorText}>{errors.position}</p></div><div className={styles.inputGroup}><label htmlFor="role">Função</label><input type="text" id="role" name="role" value={formData.role} onChange={handleChange} /></div><div className={styles.inputGroup}><label htmlFor="department">Setor/Departamento <span className={styles.required}>*</span></label><input type="text" id="department" name="department" value={formData.department} onChange={handleChange} className={errors.department ? styles.inputError : ''} /><p className={styles.errorText}>{errors.department}</p></div></div>
        <div className={styles.grid2Cols}><div className={styles.inputGroup}><label htmlFor="institutionalLink">Vínculo Institucional <span className={styles.required}>*</span></label><select id="institutionalLink" name="institutionalLink" value={formData.institutionalLink} onChange={handleChange} className={errors.institutionalLink ? styles.inputError : ''}><option value="">Selecione...</option><option value="Efetivo">Efetivo</option><option value="Comissionado Exclusivo">Comissionado Exclusivo</option><option value="Estagiário">Estagiário</option><option value="Terceirizado">Terceirizado</option><option value="Servidor Temporário">Servidor Temporário</option><option value="Consultor">Consultor</option></select><p className={styles.errorText}>{errors.institutionalLink}</p></div><div className={styles.inputGroup}><label htmlFor="functionalStatus">Situação Funcional <span className={styles.required}>*</span></label><select id="functionalStatus" name="functionalStatus" value={formData.functionalStatus} onChange={handleChange} className={errors.functionalStatus ? styles.inputError : ''}><option value="Ativo">Ativo</option><option value="Afastado">Afastado</option><option value="Licença">Licença</option><option value="Desligado">Desligado</option><option value="Férias">Férias</option></select><p className={styles.errorText}>{errors.functionalStatus}</p></div></div>
        <div className={styles.inputGroup}><label htmlFor="currentAssignment">Lotação Atual</label><input type="text" id="currentAssignment" name="currentAssignment" value={formData.currentAssignment} onChange={handleChange} /></div>
      </fieldset>

      {/* --- SEÇÃO DE OBSERVAÇÕES --- */}
       <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Observações</legend>
        <div className={styles.inputGroup}><label htmlFor="generalObservations">Observações Gerais</label><textarea id="generalObservations" name="generalObservations" value={formData.generalObservations} onChange={handleChange} rows="4" /></div>
      </fieldset>

      {/* --- BOTÕES DE AÇÃO --- */}
      <div className={styles.buttonContainer}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar</button>
      </div>
    </form>
  );
};

export default EmployeeForm;