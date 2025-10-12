const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is up and running!' });
});

app.use('/api/users', userRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/customers', customerRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});