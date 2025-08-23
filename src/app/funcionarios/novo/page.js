// app/funcionarios/novo/page.js
import Link from 'next/link';
import EmployeeForm from '../../components/EmployeeForm/EmployeeForm';
import styles from './FormPage.module.css'; // Estilo genérico para páginas de formulário

export default function NovoFuncionarioPage() {
  return (
    <main className={styles.container}>
      <div className={styles.formWrapper}>
        <header className={styles.header}>
            <Link href="/dashboard" className={styles.backLink}>&larr; Voltar</Link>
            <h1 className={styles.title}>Cadastrar Novo Funcionário</h1>
        </header>
        <EmployeeForm />
      </div>
    </main>
  );
}