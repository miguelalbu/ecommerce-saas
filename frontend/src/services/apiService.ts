const BASE_URL = 'http://localhost:3000/api';

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    const message = data.message || `Erro ${response.status}`;
    throw new Error(message);
  }
  return data;
};


export const adminLogin = async (email, password) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const customerLogin = async (email, password) => {
  const response = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const customerRegister = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(response);
};

export const getDashboardSummary = async (token: string) => {
  const response = await fetch(`${BASE_URL}/dashboard/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Enviar o token de autenticação é crucial
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getProducts = async (searchTerm?: string) => {
  let url = `${BASE_URL}/shop/products`;

  if (searchTerm && searchTerm.trim() !== '') {
    url += `?search=${encodeURIComponent(searchTerm)}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
};

export const getOrders = async (token: string) => {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Enviar o token é essencial para provar que somos um admin
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getCategories = async () => {
  const response = await fetch(`${BASE_URL}/shop/categories`);
  return handleResponse(response);
};

// Esta função cria um novo produto enviando texto e imagem
export const createProduct = async (productData: FormData, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/products`, {
    method: 'POST',
    headers: {
      // IMPORTANTE: NÃO definimos 'Content-Type'. O navegador faz isso
      'Authorization': `Bearer ${token}`,
    },
    body: productData, // Enviamos o objeto FormData diretamente
  });
  return handleResponse(response);
};

