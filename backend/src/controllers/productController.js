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

exports.getProductById = async (req, res) => {
  const { id } = req.params; // Pega o ID que vem na URL (ex: /products/xyz)
  try {
    const product = await prisma.produto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto.', error });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, categoryId } = req.body;
  try {
    const updatedProduct = await prisma.produto.update({
      where: { id },
      data: {
        nome: name,
        descricao: description,
        preco: price,
        estoque: stock,
        categoriaId: categoryId,
      },
    });
    res.json(updatedProduct);
  } catch (error) {
    // Código P2025 significa 'Record to update not found.'
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Produto não encontrado para atualização.' });
    }
    res.status(500).json({ message: 'Erro ao atualizar produto.', error });
  }
};

// Deletar um produto
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.produto.delete({
      where: { id },
    });
    // Resposta 204 significa "No Content", uma resposta de sucesso sem corpo
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Produto não encontrado para deleção.' });
    }
    res.status(500).json({ message: 'Erro ao deletar produto.', error });
  }
};