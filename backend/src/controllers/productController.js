const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
  const products = await prisma.produto.findMany({
    include: { categoria: true },
  });
  res.json(products);
};

exports.createProduct = async (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;
  try {
    const newProduct = await prisma.produto.create({
      data: {
        nome: name,
        descricao: description,
        preco: price,
        estoque: stock,
        categoriaId: categoryId,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
};