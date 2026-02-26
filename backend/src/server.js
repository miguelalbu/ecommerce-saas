require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userManagementeRoutes = require('./routes/userManagementRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is up and running!' });
});

app.use('/api/users', userRoutes); // API Users route
app.use('/api/shop', shopRoutes); // API Shop route
app.use('/api/customers', customerRoutes); // API Customers route
app.use('/api/dashboard', dashboardRoutes); // API Dashboard route
app.use('/api/orders', orderRoutes); // API Orders route
app.use('/api/user-management', userManagementeRoutes); // API User Management route
app.use('/api/checkout', checkoutRoutes); // API Checkout route

app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});