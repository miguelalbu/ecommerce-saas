const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllUsers = async (req, res) => {
  try {
    const [admins, customers] = await Promise.all([
      prisma.usuario.findMany({
        select: { id: true, nome: true, email: true, funcao: true, criadoEm: true },
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.cliente.findMany({
        select: { id: true, nome: true, email: true, criadoEm: true },
        orderBy: { criadoEm: 'desc' },
      }),
    ]);
    
    res.json({ admins, customers });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro ao buscar usuários." });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Você não pode deletar sua própria conta de administrador.' });
    }
    await prisma.usuario.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ message: "Erro ao deletar usuário." });
  }
};


exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.pedido.deleteMany({ where: { clienteId: id } });
    await prisma.cliente.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    res.status(500).json({ message: "Erro ao deletar cliente." });
  }
};