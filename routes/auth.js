const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res, next) => {

});

router.post('/signup', async (req, res, next) => {
  // Email veritabaninda mevcut mu?
  const emailExist = await User.findOne({ email: req.body.email })
  if (emailExist) return res.status(400).send('Email already exist!')
  
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
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;