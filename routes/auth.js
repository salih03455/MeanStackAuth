const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res, next) => {
  // Bu email ile kayitli bir kullanici (userData) mevcut mu?
  const userData = await User.findOne({ email: req.body.email })
  if (userData) return res.status(400).send('Email already exist!')
  
  // Parolayi sifrele:
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Yeni bir User objesi olustur:
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    // Olusturulan User objesini veritabanina kaydet:
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/login', async (req, res, next) => {
  // Bu email ile kayitli bir kullanici (userData) mevcut mu?
  const userData = await User.findOne({ email: req.body.email });
  if (!userData) return res.status(400).json({
    message: 'Email is not found!'
  });

  // Parola dogru mu?
  const validPass = await bcrypt.compare(req.body.password, userData.password)
  if (!validPass) return res.status(400).send('Invalid password!');

  // Token olustur:
  const token = jwt.sign(
    { _id: userData._id },
    process.env.TOKEN_SECRET,
    { expiresIn: '1h' }
  );

  // Token'i responsenin headerine ekle:
  res.header('auth-token', token);
  res.json({
    message: token
  });
});

module.exports = router;