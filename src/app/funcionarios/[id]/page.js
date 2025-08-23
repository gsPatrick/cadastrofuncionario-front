// app/funcionarios/[id]/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus, FiFileText, FiMessageSquare, FiSearch, FiExternalLink, FiClock } from 'react-icons/fi';
import styles from './details.module.css';

// Importando todos os componentes de formulário e o modal genérico
import Modal from '../../components/Modal/Modal';
import EmployeeForm from '../../components/EmployeeForm/EmployeeForm';
import DocumentUploadForm from '../../components/DocumentUploadForm/DocumentUploadForm';
import DocumentForm from '../../components/DocumentForm/DocumentForm'; // Para editar metadados do doc
import AnnotationForm from '../../components/AnnotationForm/AnnotationForm';

// --- Dados Fictícios (Mock Data) ---
// Contém todos os campos para simular uma resposta completa da API
const MOCK_FUNCIONARIOS = {
    '1': { 
        id: 1, nome: 'Ana Silva', dataNascimento: '1990-05-15', sexo: 'Feminino', estadoCivil: 'Casado(a)', cpf: '111.222.333-44', rg: '12.345.678-9', orgaoExpedidor: 'SSP/SP',
        telefone: '(11) 98765-4321', telefoneEmergencia: '(11) 91234-5678', emailPessoal: 'ana.silva@email.com', emailInstitucional: 'ana.silva@empresa.com',
        cep: '01000-000', logradouro: 'Rua das Flores', numero: '123', complemento: 'Apto 10', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP',
        matricula: 'F001', dataAdmissao: '2022-01-10', cargo: 'Desenvolvedora Frontend', funcao: 'Desenvolvedora Pleno', setor: 'Tecnologia', lotacaoAtual: 'Sede', vinculoInstitucional: 'Efetivo', situacaoFuncional: 'Ativo',
        observacoes: 'Especialista em React e Next.js.',
        documentos: [
            { id: 'd1', tipo: 'Contrato', descricao: 'Contrato de Trabalho Assinado (PDF)', data: '15/01/2023', url: '/docs/contrato_ana.pdf' },
            { id: 'd2', tipo: 'RG', descricao: 'Cópia digitalizada do RG', data: '20/01/2023', url: '/docs/rg_ana.jpg' }
        ], 
        anotacoes: [
            { 
                id: 'a1', 
                titulo: 'Feedback Q1', 
                categoria: 'Desempenho', 
                conteudo: 'Excelente desempenho no primeiro trimestre, superou as expectativas em 2 projetos chave.', 
                data: '10/04/2023', 
                autor: 'Carlos Andrade',
                history: [ // NOVO CAMPO: HISTÓRICO
                    { date: '05/04/2023 10:30', author: 'Carlos Andrade', oldContent: 'Bom desempenho no primeiro trimestre.' },
                    { date: '08/04/2023 14:00', author: 'Ana Paula', oldContent: 'Bom desempenho no primeiro trimestre, com algumas observações.' }
                ]
            },
            { id: 'a2', titulo: 'Treinamento Concluído', categoria: 'Desenvolvimento', conteudo: 'Concluiu o curso avançado de Next.js com 95% de aproveitamento.', data: '05/06/2023', autor: 'RH Equipe' }
        ] 
    },
    '2': { 
        id: 2, nome: 'Bruno Costa', matricula: 'F002', cargo: 'Desenvolvedor Backend', setor: 'Tecnologia', situacaoFuncional: 'Ativo', telefone: '(21) 99999-8888',
        dataNascimento: '1988-11-20', sexo: 'Masculino', estadoCivil: 'Solteiro(a)', cpf: '222.333.444-55', rg: '98.765.432-1', orgaoExpedidor: 'DETRAN/RJ',
        telefoneEmergencia: '(21) 98888-7777', emailPessoal: 'bruno.c@email.com', emailInstitucional: 'bruno.c@empresa.com',
        cep: '20000-000', logradouro: 'Av. Brasil', numero: '456', complemento: '', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ',
        dataAdmissao: '2021-03-01', funcao: 'Especialista em Node.js', lotacaoAtual: 'Escritório RJ', vinculoInstitucional: 'Efetivo',
        observacoes: 'Participa ativamente de projetos open-source.',
        documentos: [], anotacoes: [] 
    },
};

export default function FuncionarioDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState(null);
    const [activeTab, setActiveTab] = useState('info');

    // Estado centralizado para controlar todos os modais
    // Tipos de modal: 'EDIT_EMPLOYEE', 'UPLOAD_DOC', 'EDIT_DOC', 'VIEW_DOC', 'NOTE', 'VIEW_NOTE', 'VIEW_NOTE_HISTORY'
    const [modalState, setModalState] = useState({ type: null, data: null }); 

    // Estados para busca interna nas abas
    const [docSearchTerm, setDocSearchTerm] = useState('');
    const [noteSearchTerm, setNoteSearchTerm] = useState('');

    useEffect(() => {
        // Simula uma chamada de API para buscar os dados do funcionário com base no ID da URL
        const data = MOCK_FUNCIONARIOS[params.id];
        setEmployee(data);
    }, [params.id]);

    // Funções genéricas para abrir e fechar modais
    const handleOpenModal = (type, data = null) => setModalState({ type, data });
    const handleCloseModal = () => setModalState({ type: null, data: null });

    // --- Lógica de Filtragem com useMemo para otimização ---
    const filteredDocuments = useMemo(() => {
        if (!employee?.documentos) return [];
        if (!docSearchTerm) return employee.documentos;
        return employee.documentos.filter(doc => 
            doc.tipo.toLowerCase().includes(docSearchTerm.toLowerCase()) ||
            doc.descricao.toLowerCase().includes(docSearchTerm.toLowerCase())
        );
    }, [employee?.documentos, docSearchTerm]);

    const filteredAnnotations = useMemo(() => {
        if (!employee?.anotacoes) return [];
        if (!noteSearchTerm) return employee.anotacoes;
        return employee.anotacoes.filter(note =>
            note.titulo.toLowerCase().includes(noteSearchTerm.toLowerCase()) ||
            note.categoria.toLowerCase().includes(noteSearchTerm.toLowerCase()) ||
            note.conteudo.toLowerCase().includes(noteSearchTerm.toLowerCase())
        );
    }, [employee?.anotacoes, noteSearchTerm]);
    
    // --- Funções de Submissão (Submit Handlers) ---
    const handleEmployeeUpdate = (formData) => {
        // Em uma aplicação real, aqui você faria a chamada PUT/PATCH para a API com formData
        console.log("Atualizando cadastro principal:", formData);
        setEmployee(prev => ({ ...prev, ...formData }));
        handleCloseModal();
    };

    const handleDocUploadSubmit = ({ tipo, descricao, files }) => {
        // Em uma aplicação real, aqui você enviaria os arquivos para o backend via FormData
        const newDocs = files.map(file => ({
            id: `d${Date.now()}-${file.name}`, // ID único para o mock
            tipo: tipo,
            descricao: `${descricao || 'Sem descrição'} (${file.name})`,
            data: new Date().toLocaleDateString('pt-BR'),
            url: `/docs/${file.name}` // URL fictícia para simular o download
        }));
        setEmployee(prev => ({ ...prev, documentos: [...(prev.documentos || []), ...newDocs] }));
        handleCloseModal();
    };

    const handleDocSubmit = (formData) => { // Para editar metadados de um documento existente
        setEmployee(prev => ({ ...prev, documentos: prev.documentos.map(d => d.id === modalState.data.id ? { ...d, ...formData } : d) }));
        handleCloseModal();
    };

    const handleNoteSubmit = (formData) => {
        const notes = employee.anotacoes || [];
        if (modalState.data) { // Editando anotação existente
            // Simulação de adição ao histórico ao editar: registra a versão anterior
            const oldNote = notes.find(n => n.id === modalState.data.id);
            const newHistoryEntry = { 
                date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').substring(0, 5), 
                author: 'Usuário Logado', // Em app real, seria o nome do usuário logado
                oldContent: oldNote.conteudo 
            };
            setEmployee(prev => ({ 
                ...prev, 
                anotacoes: notes.map(n => 
                    n.id === modalState.data.id ? 
                    { ...n, ...formData, history: [...(n.history || []), newHistoryEntry] } : // Adiciona ao histórico
                    n
                ) 
            }));
        } else { // Adicionando nova anotação
            const newNote = { ...formData, id: `a${Date.now()}`, data: new Date().toLocaleDateString('pt-BR'), autor: 'Usuário Logado', history: [] }; // Nova anotação começa com histórico vazio
            setEmployee(prev => ({ ...prev, anotacoes: [...notes, newNote] }));
        }
        handleCloseModal();
    };
    
    // --- Funções de Exclusão (Delete Handlers) ---
    const handleDeleteEmployee = () => { 
        if(confirm('TEM CERTEZA QUE DESEJA EXCLUIR ESTE FUNCIONÁRIO?\nEsta ação não pode ser desfeita.')) { 
            console.log(`Excluindo funcionário com ID: ${employee.id}`);
            // Em uma aplicação real, aqui você faria a chamada DELETE para a API
            router.push('/dashboard'); // Redireciona de volta ao dashboard após a exclusão
        }
    };
    const handleDeleteDoc = (docId) => { 
        if(confirm('Tem certeza que deseja excluir este documento?')) {
            console.log(`Excluindo documento com ID: ${docId}`);
            setEmployee(prev => ({ ...prev, documentos: prev.documentos.filter(d => d.id !== docId) }));
        }
    };
    const handleDeleteNote = (noteId) => { 
        if(confirm('Tem certeza que deseja excluir esta anotação?')) {
            console.log(`Excluindo anotação com ID: ${noteId}`);
            setEmployee(prev => ({ ...prev, anotacoes: prev.anotacoes.filter(n => n.id !== noteId) }));
        }
    };

    // Renderiza uma mensagem de carregamento ou "não encontrado" enquanto os dados não estão prontos
    if (!employee) {
        return <div className={styles.container}><p>Carregando dados do funcionário...</p></div>;
    }

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <div>
                    <Link href="/dashboard" className={styles.backLink}>&larr; Voltar para a lista</Link>
                    <h1 className={styles.title}>{employee.nome}</h1>
                    <p className={styles.subtitle}>{employee.cargo} &bull; {employee.setor}</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.deleteButton} onClick={handleDeleteEmployee}><FiTrash2 /> Excluir Cadastro</button>
                    <button className={styles.editButton} onClick={() => handleOpenModal('EDIT_EMPLOYEE', employee)}><FiEdit /> Editar Cadastro</button>
                </div>
            </header>

            {/* Navegação por Abas */}
            <nav className={styles.tabNav}>
                <button onClick={() => setActiveTab('info')} className={activeTab === 'info' ? styles.tabButtonActive : styles.tabButton}><FiFileText /> Informações Cadastrais</button>
                <button onClick={() => setActiveTab('docs')} className={activeTab === 'docs' ? styles.tabButtonActive : styles.tabButton}><FiFileText /> Documentos</button>
                <button onClick={() => setActiveTab('notes')} className={activeTab === 'notes' ? styles.tabButtonActive : styles.tabButton}><FiMessageSquare /> Anotações</button>
            </nav>

            {/* Conteúdo das Abas */}
            <div className={styles.tabContent}>
                {activeTab === 'info' && (
                    <div className={styles.infoContainer}>
                        <div className={styles.infoSection}>
                            <h3 className={styles.sectionTitle}>Dados Pessoais</h3>
                            <div className={styles.infoGrid}>
                                <p><span className={styles.infoLabel}>Nome Completo:</span> {employee.nome || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Data de Nasc.:</span> {employee.dataNascimento || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Sexo:</span> {employee.sexo || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Estado Civil:</span> {employee.estadoCivil || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>CPF:</span> {employee.cpf || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>RG:</span> {employee.rg || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Órgão Expedidor:</span> {employee.orgaoExpedidor || 'Não informado'}</p>
                            </div>
                        </div>
                        <div className={styles.infoSection}>
                            <h3 className={styles.sectionTitle}>Contato</h3>
                            <div className={styles.infoGrid}>
                                <p><span className={styles.infoLabel}>Telefone Celular:</span> {employee.telefone || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Tel. Emergência:</span> {employee.telefoneEmergencia || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>E-mail Pessoal:</span> {employee.emailPessoal || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>E-mail Institucional:</span> {employee.emailInstitucional || 'Não informado'}</p>
                            </div>
                        </div>
                        <div className={styles.infoSection}>
                            <h3 className={styles.sectionTitle}>Endereço</h3>
                            <div className={styles.infoGrid}>
                                <p><span className={styles.infoLabel}>Logradouro:</span> {`${employee.logradouro || ''}, ${employee.numero || ''}`}</p>
                                <p><span className={styles.infoLabel}>Complemento:</span> {employee.complemento || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Bairro:</span> {employee.bairro || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Cidade/Estado:</span> {`${employee.cidade || ''} / ${employee.estado || ''}`}</p>
                                <p><span className={styles.infoLabel}>CEP:</span> {employee.cep || 'Não informado'}</p>
                            </div>
                        </div>
                        <div className={styles.infoSection}>
                            <h3 className={styles.sectionTitle}>Dados Funcionais</h3>
                            <div className={styles.infoGrid}>
                                <p><span className={styles.infoLabel}>Matrícula:</span> {employee.matricula || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Data de Admissão:</span> {employee.dataAdmissao || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Vínculo:</span> {employee.vinculoInstitucional || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Situação:</span> {employee.situacaoFuncional || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Cargo:</span> {employee.cargo || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Função:</span> {employee.funcao || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Setor:</span> {employee.setor || 'Não informado'}</p>
                                <p><span className={styles.infoLabel}>Lotação Atual:</span> {employee.lotacaoAtual || 'Não informado'}</p>
                            </div>
                        </div>
                        <div className={styles.infoSection}>
                            <h3 className={styles.sectionTitle}>Observações</h3>
                            <p>{employee.observacoes || 'Nenhuma observação.'}</p>
                        </div>
                    </div>
                )}
                
                {activeTab === 'docs' && (
                    <div>
                        <div className={styles.tabHeader}>
                            <div className={styles.searchBarContainer}>
                                <FiSearch className={styles.searchIcon} />
                                <input type="text" placeholder="Buscar em documentos..." className={styles.searchInput} value={docSearchTerm} onChange={(e) => setDocSearchTerm(e.target.value)} />
                            </div>
                            <button className={styles.listAddButton} onClick={() => handleOpenModal('UPLOAD_DOC')}><FiPlus /> Adicionar Documento(s)</button>
                        </div>
                        <ul className={styles.list}>
                            {filteredDocuments.length > 0 ? filteredDocuments.map(doc => (
                                <li key={doc.id} className={styles.listItem}>
                                    {/* CLICAR NESTA ÁREA ABRE O MODAL DE VISUALIZAÇÃO DO DOCUMENTO */}
                                    <div className={styles.listItemTextContent} onClick={() => handleOpenModal('VIEW_DOC', doc)}>
                                        <span>{doc.tipo} - {doc.descricao}</span>
                                    </div>
                                    <div className={styles.listItemActions}>
                                        <span>{doc.data}</span>
                                        <button className={styles.listActionButton} onClick={(e) => { e.stopPropagation(); handleOpenModal('EDIT_DOC', doc); }}><FiEdit /></button>
                                        <button className={styles.listDeleteButton} onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }}><FiTrash2 /></button>
                                    </div>
                                </li>
                            )) : <p>Nenhum documento encontrado.</p>}
                        </ul>
                    </div>
                )}

                {activeTab === 'notes' && (
                     <div>
                        <div className={styles.tabHeader}>
                            <div className={styles.searchBarContainer}>
                                <FiSearch className={styles.searchIcon} />
                                <input type="text" placeholder="Buscar em anotações..." className={styles.searchInput} value={noteSearchTerm} onChange={(e) => setNoteSearchTerm(e.target.value)} />
                            </div>
                            <button className={styles.listAddButton} onClick={() => handleOpenModal('NOTE')}><FiPlus /> Nova Anotação</button>
                        </div>
                        <ul className={styles.list}>
                             {filteredAnnotations.length > 0 ? filteredAnnotations.map(note => (
                                <li key={note.id} className={`${styles.listItem} ${styles.noteItem}`}>
                                    {/* CLICAR NESTA ÁREA ABRE O MODAL DE VISUALIZAÇÃO DA ANOTAÇÃO */}
                                    <div className={styles.noteItemContent} onClick={() => handleOpenModal('VIEW_NOTE', note)}>
                                        <div className={styles.noteHeader}><strong>{note.titulo}</strong> ({note.categoria})</div>
                                        <p className={styles.noteContentPreview}>{note.conteudo}</p> {/* Preview do conteúdo */}
                                    </div>
                                    <div className={styles.noteFooter}>
                                        <span>Por: {note.autor} em {note.data}</span>
                                        <div className={styles.noteActions}> {/* Container para os botões de ação da anotação */}
                                            {note.history && note.history.length > 0 && ( // Botão de histórico visível se houver histórico
                                                <button className={styles.listActionButton} onClick={(e) => { e.stopPropagation(); handleOpenModal('VIEW_NOTE_HISTORY', note.history); }}>
                                                    <FiClock /> {/* Ícone de relógio para histórico */}
                                                </button>
                                            )}
                                            <button className={styles.listActionButton} onClick={(e) => { e.stopPropagation(); handleOpenModal('NOTE', note); }}><FiEdit /></button>
                                            <button className={styles.listDeleteButton} onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}><FiTrash2 /></button>
                                        </div>
                                    </div>
                                </li>
                             )) : <p>Nenhuma anotação encontrada.</p>}
                        </ul>
                    </div>
                )}
            </div>

            {/* --- Modais Reutilizáveis --- */}
            
            {/* Modal de Edição do Cadastro Principal do Funcionário */}
            <Modal isOpen={modalState.type === 'EDIT_EMPLOYEE'} onClose={handleCloseModal} title="Editar Dados Cadastrais">
                <EmployeeForm employeeData={modalState.data} onSubmit={handleEmployeeUpdate} onCancel={handleCloseModal} />
            </Modal>

            {/* Modal para Upload de Novos Documentos */}
            <Modal isOpen={modalState.type === 'UPLOAD_DOC'} onClose={handleCloseModal} title="Enviar Novos Documentos">
                <DocumentUploadForm onSubmit={handleDocUploadSubmit} onCancel={handleCloseModal} />
            </Modal>

            {/* Modal para Edição de Metadados de Documento (tipo/descrição) */}
            <Modal isOpen={modalState.type === 'EDIT_DOC'} onClose={handleCloseModal} title="Editar Documento">
                <DocumentForm initialData={modalState.data} onSubmit={handleDocSubmit} onCancel={handleCloseModal} />
            </Modal>

            {/* Modal para Adição/Edição de Anotação */}
            <Modal isOpen={modalState.type === 'NOTE'} onClose={handleCloseModal} title={modalState.data ? "Editar Anotação" : "Nova Anotação"}>
                <AnnotationForm initialData={modalState.data} onSubmit={handleNoteSubmit} onCancel={handleCloseModal} />
            </Modal>

            {/* --- Modais de Visualização --- */}

            {/* Modal de Visualização de Documento */}
            <Modal isOpen={modalState.type === 'VIEW_DOC'} onClose={handleCloseModal} title="Visualizar Documento">
                {modalState.data && (
                    <div className={styles.viewModalContent}>
                        <p><span className={styles.infoLabel}>Tipo:</span> {modalState.data.tipo}</p>
                        <p><span className={styles.infoLabel}>Descrição:</span> {modalState.data.descricao}</p>
                        <p><span className={styles.infoLabel}>Data de Envio:</span> {modalState.data.data}</p>
                        {modalState.data.url && (
                            <a href={modalState.data.url} target="_blank" rel="noopener noreferrer" className={styles.viewDocumentLink}>
                                <FiExternalLink /> Abrir Documento
                            </a>
                        )}
                        {!modalState.data.url && <p className={styles.noFileMessage}>Arquivo não disponível para visualização (simulação).</p>}
                    </div>
                )}
            </Modal>

            {/* Modal de Visualização de Anotação Completa */}
            <Modal isOpen={modalState.type === 'VIEW_NOTE'} onClose={handleCloseModal} title="Visualizar Anotação">
                {modalState.data && (
                    <div className={styles.viewModalContent}>
                        <p><span className={styles.infoLabel}>Título:</span> {modalState.data.titulo}</p>
                        <p><span className={styles.infoLabel}>Categoria:</span> {modalState.data.categoria}</p>
                        <p><span className={styles.infoLabel}>Autor:</span> {modalState.data.autor}</p>
                        <p><span className={styles.infoLabel}>Data:</span> {modalState.data.data}</p>
                        <div className={styles.noteFullContent}>
                            <p className={styles.infoLabel}>Conteúdo:</p>
                            <p>{modalState.data.conteudo}</p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de Visualização de Histórico de Anotação */}
            <Modal isOpen={modalState.type === 'VIEW_NOTE_HISTORY'} onClose={handleCloseModal} title="Histórico de Edições">
                {modalState.data && modalState.data.length > 0 ? (
                    <div className={styles.historyList}>
                        {modalState.data.map((entry, index) => (
                            <div key={index} className={styles.historyItem}>
                                <p><span className={styles.infoLabel}>Data/Hora:</span> {entry.date}</p>
                                <p><span className={styles.infoLabel}>Autor:</span> {entry.author}</p>
                                <p><span className={styles.infoLabel}>Conteúdo Anterior:</span></p>
                                <div className={styles.historyOldContent}>"{entry.oldContent}"</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noHistoryMessage}>Nenhum histórico de edição para esta anotação.</p>
                )}
            </Modal>
        </main>
    );
}