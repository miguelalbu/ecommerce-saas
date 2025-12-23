const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os pedidos
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.pedido.findMany({
      orderBy: {
        criadoEm: 'desc',
      },
      include: {
        cliente: true, // Opcional: já traz os dados do cliente na lista
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ message: "Erro ao buscar pedidos." });
  }
};

exports.createOrder = async (req, res) => {
  const { valor_total, status, clienteId, cliente_nome, items, observacao } = req.body;

  if (!valor_total || !items || items.length === 0) {
    return res.status(400).json({ message: 'O pedido precisa ter valor total e itens.' });
  }

  try {
    // Usamos $transaction para garantir que se o estoque falhar, o pedido não é criado
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Verificar Estoque de todos os itens antes de começar
      for (const item of items) {
        const produto = await tx.produto.findUnique({ where: { id: item.productId } });
        
        if (!produto) {
          throw new Error(`Produto ID ${item.productId} não encontrado.`);
        }
        if (produto.estoque < item.quantity) {
          throw new Error(`Estoque insuficiente para o produto: ${produto.nome}. Disponível: ${produto.estoque}`);
        }
      }

      // 2. Criar o Pedido Principal
      const newOrder = await tx.pedido.create({
        data: {
          valor_total: parseFloat(valor_total),
          status: status || 'PROCESSANDO',
          // Se clienteId vier, usa ele. Se não, deixa null.
          clienteId: clienteId || null, 
          cliente_nome: cliente_nome || 'Cliente Balcão',
          // Se tiver campo observação no banco, salve aqui:
          // observacao: observacao 
        },
      });

      // 3. Processar Itens: Criar registro do item e Descontar Estoque
      for (const item of items) {
        // A. Criar o relacionamento na tabela ItemPedido (se ela existir no seu schema)
        // Se você não tiver tabela de itens separada, pode pular essa parte 'A', 
        // mas é essencial para histórico.
        await tx.itemPedido.create({
          data: {
            pedidoId: newOrder.id,
            produtoId: item.productId,
            quantidade: item.quantity,
            precoNoMomentoDaCompra: item.unitPrice
          }
        });

        // B. Descontar do Estoque
        await tx.produto.update({
          where: { id: item.productId },
          data: {
            estoque: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    res.status(201).json(result);

  } catch (error) {
    console.error("Erro ao processar pedido:", error);
    // Retorna mensagem amigável se for erro de estoque
    res.status(400).json({ 
      message: error.message || "Erro ao criar pedido.", 
      details: error.message 
    });
  }
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.pedido.findUnique({
      where: { id },
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