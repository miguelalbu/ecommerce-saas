// src/controllers/checkoutController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.placeOrder = async (req, res) => {
  const { cartItems, address, isPickup } = req.body;
  const userId = req.user?.id; // Pode ser undefined se for convidado

  // Validação básica
  if (!cartItems || cartItems.length === 0 || !address) {
    return res.status(400).json({ message: 'Carrinho e endereço são obrigatórios.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar produtos no banco (Segurança de preço e estoque)
      const productIds = cartItems.map(item => item.id);
      const productsFromDb = await tx.produto.findMany({
        where: { id: { in: productIds } },
      });

      let total = 0;
      const orderItemsData = [];

      // 2. Validar Estoque e Calcular Total Real
      for (const cartItem of cartItems) {
        const product = productsFromDb.find(p => p.id === cartItem.id);
        
        if (!product) throw new Error(`Produto ID ${cartItem.id} não encontrado.`);
        
        // Verifica estoque
        if (product.estoque < cartItem.quantity) {
          throw new Error(`Estoque insuficiente: ${product.nome}. Restam: ${product.estoque}`);
        }
        
        const itemTotal = Number(product.preco) * cartItem.quantity;
        total += itemTotal;
        
        orderItemsData.push({
          produtoId: product.id,
          quantidade: cartItem.quantity,
          precoNoMomentoDaCompra: product.preco, // O banco espera Decimal ou Float
        });
      }

      // 3. Formatar Texto de Entrega (Para o campo 'observacao')
      let deliveryInfoString = "";
      if (isPickup) {
        deliveryInfoString = `[RETIRADA NA LOJA]
Local: ${address.complemento || 'Loja Física'}
Endereço da Loja: ${address.rua}, ${address.numero}, ${address.bairro} - ${address.cidade}/${address.estado}.`;
      } else {
        deliveryInfoString = `[ENTREGA EM DOMICÍLIO]
Endereço: ${address.rua}, ${address.numero}
Bairro: ${address.bairro}
Cidade: ${address.cidade}/${address.estado}
CEP: ${address.cep}
Complemento: ${address.complemento || 'N/A'}`;
      }

      // 4. Salvar Endereço no Perfil (Apenas se logado e for entrega)
      if (userId && !address.id && !isPickup) {
        const { id, ...addressData } = address; // Remove ID temporário do front
        await tx.endereco.create({
          data: {
            ...addressData,
            cliente: { connect: { id: userId } }
          },
        });
      }

      // 5. Preparar dados do Pedido
      // Definimos o nome: Se tem login, null (pega do cadastro). Se não tem, pega do form.
      const clienteNome = userId ? undefined : `${address.nome || ''} ${address.sobrenome || ''}`.trim();

      const pedidoData = {
        valor_total: total,
        status: 'PROCESSANDO',
        observacao: deliveryInfoString, // Agora o banco vai aceitar isso!
        cliente_nome: clienteNome, 
      };

      // Se tiver usuário logado, conecta.
      if (userId) {
        pedidoData.cliente = { connect: { id: userId } };
      }

      // 6. Criar o Pedido
      const createdOrder = await tx.pedido.create({
        data: pedidoData
      });

      // 7. Criar os Itens
      if (orderItemsData.length > 0) {
          await tx.itemPedido.createMany({
            data: orderItemsData.map(item => ({ 
                ...item, 
                pedidoId: createdOrder.id 
            })),
          });
      }

      // 8. Baixar Estoque
      for (const item of orderItemsData) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: item.quantidade } },
        });
      }

      // 9. Retornar Pedido Completo (Com itens) para o Frontend
      const fullOrder = await tx.pedido.findUnique({
        where: { id: createdOrder.id },
        include: { 
            itens: { 
                include: { produto: true } 
            } 
        }
      });

      return fullOrder;
    });

    return res.status(201).json(result);

  } catch (error) {
    console.error("Erro checkout:", error);
    // Retorna erro JSON legível para o front não dar "Unexpected token"
    return res.status(400).json({ message: error.message || "Erro ao processar pedido." });
  }
};