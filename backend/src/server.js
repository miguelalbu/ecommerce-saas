const express = require('express');

const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is up and running!' });
});

app.use('/api/users', userRoutes);
app.use('/api/shop', shopRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});