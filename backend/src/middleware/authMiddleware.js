const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Pega o token do cabeçalho
      token = req.headers.authorization.split(' ')[1];

      // 2. Decodifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Busca o usuário na tabela correta com base no role do token
      let currentUser;

      if (decoded.role === 'CUSTOMER') {
        currentUser = await prisma.cliente.findUnique({
          where: { id: decoded.id },
          select: { id: true, nome: true, email: true }
        });
        if (currentUser) currentUser.role = 'CUSTOMER';
      } else {
        currentUser = await prisma.usuario.findUnique({
          where: { id: decoded.id },
          select: { id: true, nome: true, email: true, funcao: true }
        });
        if (currentUser) currentUser.role = currentUser.funcao;
      }

      // 4. Verifica se o usuário ainda existe
      if (!currentUser) {
        return res.status(401).json({
          message: 'O usuário dono deste token não existe mais.'
        });
      }

      // 5. Adiciona o usuário ao request
      req.user = currentUser;
      
      return next();

    } catch (error) {
      console.error("Erro de autenticação:", error.message);
      return res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, login necessário.' });
  }
};

// Middleware para restringir acesso a certos cargos
// Exemplo de uso nas rotas: authorize('ADMIN', 'GERENTE')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Verifica se o role do usuário está na lista de roles permitidos
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Acesso negado. Você não tem permissão de Administrador.'
      });
    }
    next();
  };
};