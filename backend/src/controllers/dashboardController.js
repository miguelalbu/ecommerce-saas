const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSummary = async (req, res) => {
  try {
    const lowStockThreshold = 10;

    const [totalProducts, totalCustomers, totalOrders, revenueData, stockProducts] = await Promise.all([
      prisma.produto.count(),
      prisma.cliente.count(),
      prisma.pedido.count(),
      prisma.pedido.aggregate({
        _sum: { valor_total: true },
        where: { status: { not: 'CANCELADO' } },
      }),
      prisma.produto.findMany({
        where: { ativo: true },
        select: { preco: true, precoCompra: true, estoque: true },
      }),
    ]);

    const recentOrders = await prisma.pedido.findMany({
      take: 5,
      orderBy: { criadoEm: 'desc' },
    });

    const lowStockProducts = await prisma.produto.findMany({
      where: { estoque: { lt: lowStockThreshold } },
      take: 5,
      orderBy: { estoque: 'asc' },
      include: { categoria: true }
    });

    // Métricas de estoque
    let investimentoEstoque = 0;
    let receitaPotencial = 0;
    for (const p of stockProducts) {
      receitaPotencial += Number(p.preco) * p.estoque;
      if (p.precoCompra !== null) {
        investimentoEstoque += Number(p.precoCompra) * p.estoque;
      }
    }
    const lucroPotencial = receitaPotencial - investimentoEstoque;
    const margemLucro = investimentoEstoque > 0
      ? Number(((lucroPotencial / investimentoEstoque) * 100).toFixed(1))
      : null;

    const summary = {
      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue: revenueData._sum.valor_total || 0,
        receitaPotencial,
        investimentoEstoque,
        lucroPotencial,
        margemLucro,
      },
      recentOrders,
      lowStockProducts,
    };

    res.json(summary);

  } catch (error) {
    console.error("Erro ao buscar resumo do dashboard:", error);
    res.status(500).json({ message: "Erro ao buscar resumo do dashboard." });
  }
};