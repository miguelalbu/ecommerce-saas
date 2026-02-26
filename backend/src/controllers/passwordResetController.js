const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail } = require('../services/emailService');

const prisma = new PrismaClient();

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório.' });
  }

  try {
    // Busca em usuarios (admin) e depois em clientes
    let user = await prisma.usuario.findUnique({ where: { email } });
    let userType = 'admin';

    if (!user) {
      user = await prisma.cliente.findUnique({ where: { email } });
      userType = 'customer';
    }

    // Se encontrou o usuário, gera o token e envia o e-mail
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      const updateData = { resetToken: hashedToken, resetTokenExpiry: expiry };

      if (userType === 'admin') {
        await prisma.usuario.update({ where: { id: user.id }, data: updateData });
      } else {
        await prisma.cliente.update({ where: { id: user.id }, data: updateData });
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&type=${userType}`;
      await sendPasswordResetEmail(email, resetUrl, user.nome);
    }
  } catch (error) {
    console.error('Erro no forgot-password:', error);
  }

  // Sempre retorna a mesma resposta para não revelar se o e-mail existe
  res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções em breve.' });
};

exports.resetPassword = async (req, res) => {
  const { token, type, password } = req.body;

  if (!token || !type || !password) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();

    let user;
    if (type === 'admin') {
      user = await prisma.usuario.findFirst({
        where: { resetToken: hashedToken, resetTokenExpiry: { gt: now } },
      });
    } else {
      user = await prisma.cliente.findFirst({
        where: { resetToken: hashedToken, resetTokenExpiry: { gt: now } },
      });
    }

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const clearToken = { resetToken: null, resetTokenExpiry: null };

    if (type === 'admin') {
      await prisma.usuario.update({
        where: { id: user.id },
        data: { senhaHash: passwordHash, ...clearToken },
      });
    } else {
      await prisma.cliente.update({
        where: { id: user.id },
        data: { senhaHash: passwordHash, ...clearToken },
      });
    }

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro no reset-password:', error);
    res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
};
