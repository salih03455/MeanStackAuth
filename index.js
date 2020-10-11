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
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log('MongoDB baglantisi basarili :)'))
.catch(err => console.log('MongoDB baglantisi sirasinda hata olustu: ', err));

// Middleware
app.use(express.json());

/* Cors hatasini engellemek icin (https://enable-cors.org/server_expressjs.html): */
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // izin verilen adres
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id"
	);
	res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH');
	res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
	next();
});

// Route Middlewares:
app.use('/api/user', authRoute); // authRoute icindeki endpointlere /api/user prefixi getir

app.listen(3000, () => console.log('Server up and running'));