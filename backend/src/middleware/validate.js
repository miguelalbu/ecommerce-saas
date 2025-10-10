const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      message: 'Dados de entrada inválidos.',
      errors: error.errors,
    });
  }
};

module.exports = validate;