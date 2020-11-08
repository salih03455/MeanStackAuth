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

  // Token olustur (access token):
  const accessToken = createToken('access', userData._id);

  console.log('access token: ', accessToken);

  // Token olustur (refresh token):
  const refreshToken = createToken('refresh', userData._id);

  // Refresh tokeni db'ye ekle:
  await User.findOneAndUpdate(
    { email: req.body.email },
    { refreshToken: refreshToken.token },
    { upsert: true },
    function(err, doc) {
      if (err) return res.send(500, {error: err});
      res.json({
        accessToken: accessToken.token,
        expiresIn: accessToken.expiresIn, // 60 (sn)
        email: doc.email
      });
    }
  );
});

router.get('/refresh-token', async (req, res) => {
  const email = req.header('email');
  const userData = await User.findOne({ email })
  if (!userData) {
    return res.status(400).json({ // status degisebilir
      message: 'Refresh token is don\'t find'
    })
  }
  const refreshToken = userData.refreshToken;
  console.log('refresh token: ', refreshToken);

  try {
    // refresh token gecerli mi?
    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log('verified: ', verified)

    // refresh token gecerli ise
    if (verified) {
      // Token olustur (access token):
      const accessToken = createToken('access', userData._id);

      res.json({
        accessToken: accessToken.token,
        expiresIn: accessToken.expiresIn, // 60 (sn)
      });
    }
    
  } catch (err) {
    console.log('error: ', err);
  }
  
});

function createToken(tokenType, userId) {
  let secret = '';
  let expiresIn = '';

  if (tokenType === 'access') {
    secret = process.env.ACCESS_TOKEN_SECRET;
    expiresIn = 30 // sn
  }

  if (tokenType === 'refresh') {
    secret = process.env.REFRESH_TOKEN_SECRET;
    expiresIn = 300 // sn (5 min)
  }

  const token = jwt.sign({ _id: userId }, secret, { expiresIn });
  return { token, expiresIn }
}

module.exports = router;