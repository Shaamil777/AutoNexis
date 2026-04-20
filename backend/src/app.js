const express = require("express");
const cors = require("cors");
const orderRoutes = require('./routes/orderRoutes')
const webhookRoutes = require('./routes/webhookRoutes')

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders',orderRoutes)
app.use('/api/webhooks',webhookRoutes)

module.exports = app;