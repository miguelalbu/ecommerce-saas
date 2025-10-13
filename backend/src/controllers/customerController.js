const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

exports.registerCustomer = async (req, res) => {
  // 1. Coletar todos os novos campos do corpo da requisição
  const { name, sobrenome, email, password, cpf, telefone, dataNascimento, genero } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 2. Salvar os novos campos no banco de dados
    const newCustomer = await prisma.cliente.create({
      data: { 
        nome: name,
        sobrenome,
        email, 
        senhaHash: passwordHash,
        cpf,
        telefone,
        // Converte a data de string para o formato Date, se ela existir
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        genero,
      },
    });

    const { senhaHash: _, ...customerWithoutPassword } = newCustomer;
    res.status(201).json(customerWithoutPassword);
  } catch (error) {
    console.error("ERRO AO REGISTRAR CLIENTE:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Este e-mail ou CPF já está em uso.' });
    }
    res.status(500).json({ message: 'Error registering customer.' });
  }
};

// Login de um cliente
exports.loginCustomer = async (req, res) => {
    const { email, password } = req.body;
    try {
        const customer = await prisma.cliente.findUnique({ where: { email } });
        if (!customer || !(await bcrypt.compare(password, customer.senhaHash))) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }
        const token = jwt.sign(
            { id: customer.id, role: 'CUSTOMER' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer login.', error });
    }
};