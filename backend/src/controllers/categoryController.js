const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCategories = async (req, res) => {
  const categories = await prisma.categoria.findMany();
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const newCategory = await prisma.categoria.create({ data: { nome: name } });
  res.status(201).json(newCategory);
};


exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const productsInCategory = await prisma.produto.count({ where: { categoriaId: id } });
    if (productsInCategory > 0) {
      return res.status(400).json({ message: 'Não é possível deletar uma categoria que contém produtos.' });
    }

    await prisma.categoria.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    console.error("Erro ao deletar categoria:", error);
    res.status(500).json({ message: 'Erro ao deletar categoria.' });
  }
};