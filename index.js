const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
// Import Routes:
const authRoute = require('./routes/auth');

dotenv.config();

// Connect to db:
mongoose.connect(
  process.env.DB_CONNECT, // .env dosyasindan aldik
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log('Connected to db');
  }
);

// Middleware
app.use(express.json());

// Route Middlewares:
app.use('/api/user', authRoute); // authRoute icindeki endpointlere /api/user prefixi getir

app.listen(3000, () => console.log('Server up and running'));