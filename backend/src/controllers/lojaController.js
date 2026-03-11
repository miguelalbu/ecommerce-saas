const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllLojas = async (req, res) => {
  try {
    const lojas = await prisma.loja.findMany({ orderBy: { criadoEm: 'asc' } });
    res.json(lojas);
  } catch (error) {
    console.error('Erro ao buscar lojas:', error);
    res.status(500).json({ message: 'Erro ao buscar lojas.' });
  }
};

exports.createLoja = async (req, res) => {
  const { nome, endereco, telefone } = req.body;
  if (!nome) return res.status(400).json({ message: 'Nome da loja é obrigatório.' });
  try {
    const loja = await prisma.loja.create({ data: { nome, endereco, telefone } });
    res.status(201).json(loja);
  } catch (error) {
    console.error('Erro ao criar loja:', error);
    res.status(500).json({ message: 'Erro ao criar loja.' });
  }
};

exports.updateLoja = async (req, res) => {
  const { id } = req.params;
  const { nome, endereco, telefone, ativo } = req.body;
  try {
    const loja = await prisma.loja.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(endereco !== undefined && { endereco }),
        ...(telefone !== undefined && { telefone }),
        ...(ativo !== undefined && { ativo }),
      },
    });
    res.json(loja);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Loja não encontrada.' });
    console.error('Erro ao atualizar loja:', error);
    res.status(500).json({ message: 'Erro ao atualizar loja.' });
  }
};

exports.deleteLoja = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.loja.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Loja não encontrada.' });
    if (error.code === 'P2003') return res.status(400).json({ message: 'Não é possível deletar esta loja pois ela possui pedidos vinculados.' });
    console.error('Erro ao deletar loja:', error);
    res.status(500).json({ message: 'Erro ao deletar loja.' });
  }
};
