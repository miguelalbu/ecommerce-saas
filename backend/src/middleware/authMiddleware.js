const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Pega o token
      token = req.headers.authorization.split(' ')[1];

      // 2. Decodifica
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Adiciona o usuário ao request
      // Dica: Se quiser garantir que o usuário ainda existe no banco, você poderia fazer uma busca aqui,
      // mas apenas 'decoded' já serve para pegar o ID.
      req.user = decoded; 
      
      // 4. Passa para o próximo controller
      return next(); 

    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, sem token.' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acesso negado. A função '${req.user?.role}' não tem permissão.`
      });
    }
    next();
  };
};