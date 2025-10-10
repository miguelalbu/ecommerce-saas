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