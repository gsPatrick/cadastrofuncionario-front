// app/layout.js
import './globals.css'; // Importação de estilos globais
import { AuthProvider } from './context/AuthContext'; // Importa o AuthProvider
import AppLayout from './components/AppLayout/AppLayout'; // Importa o layout condicional

export const metadata = {
  title: 'Sistema de Gestão de Funcionários',
  description: 'Gerenciamento de RH e Funcionários',
};

// Este é um Server Component. Ele NÃO PODE usar 'usePathname' ou outros hooks.
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {/* A lógica de renderização condicional foi movida para AppLayout */}
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}