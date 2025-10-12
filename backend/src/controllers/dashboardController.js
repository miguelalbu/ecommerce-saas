const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSummary = async (req, res) => {
  try {
    const lowStockThreshold = 10;

    const [totalProducts, totalCustomers, totalOrders, revenueData] = await Promise.all([
      prisma.produto.count(),
      prisma.cliente.count(),
      prisma.pedido.count(),
      prisma.pedido.aggregate({
        _sum: { valor_total: true },
        where: { status: { not: 'CANCELADO' } },
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
    
    const summary = {
      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue: revenueData._sum.valor_total || 0,
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