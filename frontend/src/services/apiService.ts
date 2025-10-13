export const BACKEND_URL = 'http://localhost:3000';
const BASE_URL = `${BACKEND_URL}/api`;

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

export const getProducts = async (
  searchTerm?: string,
  categoryId?: string,
  sortBy?: string
) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);
  if (sortBy) params.append('sortBy', sortBy);

  const response = await fetch(`${BASE_URL}/shop/products?${params.toString()}`);
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


export const getProductById = async (id: string) => {
  const response = await fetch(`${BASE_URL}/shop/products/${id}`);
  return handleResponse(response);
};

export const updateProduct = async (id: string, productData: FormData, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/products/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: productData,
  });
  return handleResponse(response);
};

export const deleteProduct = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const data = await response.json();
    const message = data.message || `Erro ${response.status}`;
    throw new Error(message);
  }
  return true; // Retorna true em caso de sucesso
};


export const createCategory = async (name: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
};

export const deleteCategory = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar');
  }
  return true;
};

export const getUsers = async (token: string) => {
  const response = await fetch(`${BASE_URL}/user-management`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const deleteUser = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/user-management/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar');
  }
  return true;
};


export const deleteCustomer = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/user-management/customers/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar');
  }
  return true;
};

export const getOrderById = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/orders/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

type RegisterData = {
  name: string;
  sobrenome: string;
  email: string;
  password: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  genero: string;
};

// A função agora aceita um único objeto com todos os dados
export const customerRegister = async (data: RegisterData) => {
  const response = await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // Envia o objeto completo
  });
  return handleResponse(response);
};

export const getProfile = async (token: string) => {
  const response = await fetch(`${BASE_URL}/customers/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const getAddresses = async (token: string) => {
  const response = await fetch(`${BASE_URL}/customers/addresses`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const addAddress = async (addressData: any, token: string) => {
  const response = await fetch(`${BASE_URL}/customers/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
  return handleResponse(response);
};