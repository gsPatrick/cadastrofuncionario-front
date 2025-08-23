// components/EmployeeTable/EmployeeTable.js
import Link from 'next/link';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import styles from './EmployeeTable.module.css';

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  if (!employees || employees.length === 0) {
    return <p className={styles.noData}>Nenhum funcionário encontrado.</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Matrícula</th>
            <th>Cargo</th>
            <th>Telefone</th>
            <th>Situação Funcional</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((func) => (
            <tr key={func.id}>
              {/* Ajuste dos nomes dos campos para corresponder à API */}
              <td><Link href={`/funcionarios/${func.id}`} className={styles.nameLink}>{func.fullName}</Link></td>
              <td>{func.registrationNumber}</td>
              <td>{func.position}</td>
              <td>{func.mobilePhone1 || '-'}</td>
              <td>
                <span className={`${styles.statusPill} ${styles[(func.functionalStatus || 'inativo').toLowerCase()]}`}>
                  {func.functionalStatus}
                </span>
              </td>
              <td className={styles.actionsCell}>
                <button onClick={() => onEdit(func)} className={styles.actionIcon}><FiEdit /></button>
                <button onClick={() => onDelete(func.id)} className={styles.actionIcon}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;