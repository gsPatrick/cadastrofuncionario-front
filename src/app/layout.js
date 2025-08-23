// app/layout.js
import './globals.css';
import styles from './layout.module.css'; // Importa o CSS para o layout (corpo da página)
import Header from './components/Header/Header'; // Importa o componente Header
import Footer from './components/Footer/Footer'; // Importa o componente Footer

export const metadata = {
  title: 'Sistema de Gestão de Funcionários',
  description: 'Gerenciamento de RH e Funcionários',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={styles.bodyLayout}>
        <Header /> {/* Renderiza o componente Header */}
        {/* 
          Wrapper para o conteúdo principal.
          Ele agora tem padding-top (para o header) e padding-bottom (para o footer).
        */}
        <div className={styles.mainContentWrapper}>
          {children}
        </div>
        <Footer /> {/* Renderiza o componente Footer fixo */}
      </body>
    </html>
  );
}