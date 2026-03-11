// src/controllers/cupomController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCupons = async (req, res) => {
  try {
    const cupons = await prisma.cupom.findMany({ orderBy: { criadoEm: 'desc' } });
    res.json(cupons);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar cupons.' });
  }
};

exports.createCupom = async (req, res) => {
  const { codigo, tipo, valor, minimo, usosMaximos, dataExpiracao } = req.body;

  if (!codigo || !tipo || valor === undefined) {
    return res.status(400).json({ message: 'Código, tipo e valor são obrigatórios.' });
  }
  if (!['PERCENTUAL', 'VALOR'].includes(tipo)) {
    return res.status(400).json({ message: 'Tipo inválido. Use PERCENTUAL ou VALOR.' });
  }

  try {
    const cupom = await prisma.cupom.create({
      data: {
        codigo: codigo.toUpperCase().trim(),
        tipo,
        valor: parseFloat(valor),
        minimo: minimo ? parseFloat(minimo) : null,
        usosMaximos: usosMaximos ? parseInt(usosMaximos) : null,
        dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
      },
    });
    res.status(201).json(cupom);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Já existe um cupom com este código.' });
    }
    res.status(500).json({ message: 'Erro ao criar cupom.' });
  }
};

exports.updateCupom = async (req, res) => {
  const { id } = req.params;
  const { codigo, tipo, valor, minimo, usosMaximos, dataExpiracao, ativo } = req.body;

  try {
    const data = {};
    if (codigo !== undefined) data.codigo = codigo.toUpperCase().trim();
    if (tipo !== undefined) data.tipo = tipo;
    if (valor !== undefined) data.valor = parseFloat(valor);
    if (minimo !== undefined) data.minimo = minimo ? parseFloat(minimo) : null;
    if (usosMaximos !== undefined) data.usosMaximos = usosMaximos ? parseInt(usosMaximos) : null;
    if (dataExpiracao !== undefined) data.dataExpiracao = dataExpiracao ? new Date(dataExpiracao) : null;
    if (ativo !== undefined) data.ativo = ativo;

    const cupom = await prisma.cupom.update({ where: { id }, data });
    res.json(cupom);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Cupom não encontrado.' });
    if (error.code === 'P2002') return res.status(409).json({ message: 'Código já está em uso.' });
    res.status(500).json({ message: 'Erro ao atualizar cupom.' });
  }
};

exports.deleteCupom = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.cupom.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Cupom não encontrado.' });
    if (error.code === 'P2003') return res.status(409).json({ message: 'Cupom está vinculado a pedidos e não pode ser removido.' });
    res.status(500).json({ message: 'Erro ao deletar cupom.' });
  }
};

// Endpoint público para validar um cupom no checkout
exports.validateCupom = async (req, res) => {
  const { codigo, total } = req.body;

  if (!codigo) return res.status(400).json({ message: 'Código do cupom é obrigatório.' });

  try {
    const cupom = await prisma.cupom.findUnique({ where: { codigo: codigo.toUpperCase().trim() } });

    if (!cupom) return res.status(404).json({ message: 'Cupom não encontrado.' });
    if (!cupom.ativo) return res.status(400).json({ message: 'Este cupom não está ativo.' });
    if (cupom.dataExpiracao && new Date() > cupom.dataExpiracao) {
      return res.status(400).json({ message: 'Este cupom está expirado.' });
    }
    if (cupom.usosMaximos !== null && cupom.usosAtuais >= cupom.usosMaximos) {
      return res.status(400).json({ message: 'Este cupom atingiu o limite de usos.' });
    }
    if (cupom.minimo !== null && total < Number(cupom.minimo)) {
      return res.status(400).json({
        message: `Pedido mínimo de R$ ${Number(cupom.minimo).toFixed(2)} para usar este cupom.`,
      });
    }

    let desconto = 0;
    if (cupom.tipo === 'PERCENTUAL') {
      desconto = (total * Number(cupom.valor)) / 100;
    } else {
      desconto = Math.min(Number(cupom.valor), total);
    }

    res.json({ cupom, desconto: parseFloat(desconto.toFixed(2)) });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao validar cupom.' });
  }
};
