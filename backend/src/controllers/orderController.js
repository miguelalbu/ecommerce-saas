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