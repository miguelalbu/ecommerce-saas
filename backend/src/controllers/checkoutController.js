const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.placeOrder = async (req, res) => {
  const { cartItems, address } = req.body;
  const userId = req.user?.id;

  if (!cartItems || cartItems.length === 0 || !address) {
    return res.status(400).json({ message: 'Carrinho e endereço são obrigatórios.' });
  }

  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      const productIds = cartItems.map(item => item.id);
      const productsFromDb = await tx.produto.findMany({
        where: { id: { in: productIds } },
      });

      let total = 0;
      const orderItemsData = [];

      for (const cartItem of cartItems) {
        const product = productsFromDb.find(p => p.id === cartItem.id);
        if (!product) throw new Error(`Produto com ID ${cartItem.id} não encontrado.`);
        if (product.estoque < cartItem.quantity) {
          throw new Error(`Estoque insuficiente para o produto: ${product.nome}`);
        }
        
        const itemTotal = Number(product.preco) * cartItem.quantity;
        total += itemTotal;
        
        orderItemsData.push({
          produtoId: product.id,
          quantidade: cartItem.quantity,
          precoNoMomentoDaCompra: product.preco,
        });
      }

      let finalAddress = address;
      if (userId && !address.id) {
        finalAddress = await tx.endereco.create({
          data: { ...address, clienteId: userId },
        });
      }

      const createdOrder = await tx.pedido.create({
        data: {
          clienteId: userId, 
          valor_total: total,
          status: 'PROCESSANDO',
          cliente_nome: userId ? undefined : `${address.nome} ${address.sobrenome}`, // Salva nome para convidados
        },
      });

      await tx.itemPedido.createMany({
        data: orderItemsData.map(item => ({ ...item, pedidoId: createdOrder.id })),
      });

      for (const item of orderItemsData) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: item.quantidade } },
        });
      }

      return createdOrder;
    });

    res.status(201).json(newOrder);

  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    res.status(400).json({ message: error.message || "Erro ao finalizar pedido." });
  }
};