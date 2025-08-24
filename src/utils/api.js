// utils/api.js

export const API_BASE_URL = 'https://n8n-cadastrofuncionario-api.r954jc.easypanel.host/api';

/**
 * Obtém o token de autenticação do localStorage.
 * @returns {string|null} O token JWT ou nulo se não existir.
 */
export const getToken = () => {
  // Verifica se o código está rodando no lado do cliente
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

/**
 * Cria os cabeçalhos padrão para requisições autenticadas.
 * @returns {HeadersInit} Objeto de cabeçalhos.
 */
export const getAuthHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};