const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
  const { search, categoryId, sortBy } = req.query;

  const whereCondition = {
    ...(search && { nome: { contains: search, mode: 'insensitive' } }),
    ...(categoryId && { categoriaId: categoryId }),
  };

  let orderByCondition = {};
  switch (sortBy) {
    case 'price-asc':
      orderByCondition = { preco: 'asc' };
      break;
    case 'price-desc':
      orderByCondition = { preco: 'desc' };
      break;
    case 'name':
      orderByCondition = { nome: 'asc' };
      break;
    default:
      orderByCondition = { criadoEm: 'desc' };
      break;
  }

  try {
    const products = await prisma.produto.findMany({
      where: whereCondition,
      orderBy: orderByCondition,
      include: { categoria: true },
    });
    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro ao buscar produtos." });
  }
};

exports.createProduct = async (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;
  
  const imageUrl = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const newProduct = await prisma.produto.create({
      data: {
        nome: name,
        descricao: description,
        preco: parseFloat(price),
        estoque: parseInt(stock, 10),
        categoriaId: categoryId,
        imageUrl: imageUrl,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ message: "Erro ao criar produto", error });
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

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, categoryId } = req.body;

  // Objeto que conterá apenas os dados a serem atualizados
  const dataToUpdate = {
    nome: name,
    descricao: description,
    preco: parseFloat(price),
    estoque: parseInt(stock, 10),
    categoriaId: categoryId,
  };

  // Se uma nova imagem foi enviada, adiciona o novo caminho ao objeto de atualização
  if (req.file) {
    dataToUpdate.imageUrl = `uploads/${req.file.filename}`;
    // Aqui você pode adicionar uma lógica para deletar a imagem antiga do servidor se desejar
  }

  try {
    const updatedProduct = await prisma.produto.update({
      where: { id },
      data: dataToUpdate,
    });
    res.json(updatedProduct);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Produto não encontrado para atualização.' });
    }
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ message: 'Erro ao atualizar produto.', error });
  }
};