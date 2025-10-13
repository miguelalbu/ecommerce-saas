const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os pedidos
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.pedido.findMany({
      orderBy: {
        criadoEm: 'desc', // Mostra os pedidos mais recentes primeiro
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ message: "Erro ao buscar pedidos." });
  }
};

// Cria um novo pedido (rota de admin para testes)
exports.createOrder = async (req, res) => {
  const { valor_total, status, clienteId, cliente_nome } = req.body;

  // Validação básica
  if (!valor_total || !clienteId) {
    return res.status(400).json({ message: 'valor_total e clienteId são obrigatórios.' });
  }

  try {
    const newOrder = await prisma.pedido.create({
      data: {
        valor_total: parseFloat(valor_total),
        status: status || 'PROCESSANDO',
        clienteId: clienteId,
        cliente_nome: cliente_nome,
      },
    });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ message: "Erro ao criar pedido." });
  }
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.pedido.findUnique({
      where: { id },
      // O 'include' é poderoso: ele busca os dados do cliente relacionado junto com o pedido
      include: {
        cliente: true, 
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    res.json(order);
  } catch (error) {
    console.error("Erro ao buscar detalhes do pedido:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes do pedido." });
  }
};