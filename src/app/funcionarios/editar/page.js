// app/funcionarios/editar/[id]/page.js
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import EmployeeForm from '../../funcionarios/novo/FormPage.module.css';
import styles from '../../funcionarios/novo/FormPage.module.css'; // Reutilizando o estilo genérico

// Reutilizando os mesmos dados fictícios do sistema
const MOCK_FUNCIONARIOS = [
    { id: 1, nome: 'Ana Silva', matricula: 'F001', cargo: 'Desenvolvedora Frontend', setor: 'Tecnologia', status: 'Ativo', cpf: '111.222.333-44', rg: '12.345.678-9', endereco: 'Rua das Flores, 123, São Paulo, SP' },
    { id: 2, nome: 'Bruno Costa', matricula: 'F002', cargo: 'Desenvolvedor Backend', setor: 'Tecnologia', status: 'Ativo', cpf: '222.333.444-55' },
    { id: 3, nome: 'Carla Dias', matricula: 'F003', cargo: 'UI/UX Designer', setor: 'Produto', status: 'Ativo', cpf: '333.444.555-66' },
    { id: 4, nome: 'Daniel Martins', matricula: 'F004', cargo: 'Gerente de Projetos', setor: 'Gerência', status: 'Férias', cpf: '444.555.666-77' },
    { id: 5, nome: 'Elisa Ferreira', matricula: 'F005', cargo: 'Analista de QA', setor: 'Tecnologia', status: 'Inativo', cpf: '555.666.777-88' },
    { id: 6, nome: 'Fábio Souza', matricula: 'F006', cargo: 'DevOps', setor: 'Infraestrutura', status: 'Ativo', cpf: '666.777.888-99' },
];

export default function EditarFuncionarioPage() {
    const params = useParams();
    const employee = MOCK_FUNCIONARIOS.find(f => f.id.toString() === params.id);

    if (!employee) {
        return (
            <main className={styles.container}>
                <div className={styles.formWrapper}>
                    <p>Funcionário não encontrado.</p>
                    <Link href="/dashboard" className={styles.backLink}>Voltar para o Dashboard</Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.formWrapper}>
                <header className={styles.header}>
                    <Link href={`/funcionarios/${employee.id}`} className={styles.backLink}>&larr; Voltar para os Detalhes</Link>
                    <h1 className={styles.title}>Editar Dados de {employee.nome}</h1>
                </header>
                {/* 
                    Passamos os dados do funcionário para o formulário.
                    O componente EmployeeForm já sabe como preencher os campos com esses dados.
                */}
                <EmployeeForm employeeData={employee} />
            </div>
        </main>
    );
}