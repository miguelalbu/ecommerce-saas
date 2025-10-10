const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;

  // O token geralmente é enviado no header 'Authorization' no formato 'Bearer TOKEN'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Extrair o token do header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verificar se o token é válido usando a chave secreta
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Anexar os dados do usuário (do token) ao objeto 'req'
      // para que as próximas rotas possam usá-lo
      req.user = decoded;

      // 4. Chamar a próxima função no ciclo da requisição
      next();

    } catch (error) {
      res.status(401).json({ message: 'Token não é válido ou expirou.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, token não encontrado.' });
  }
};