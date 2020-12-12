const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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

  // Random string olustur:
  const random = crypto.randomBytes(32).toString('hex');
  // Token olustur (access token):
  const accessToken = createToken('access', { id: userData._id, random });
  // Token olustur (refresh token):
  const refreshToken = createToken('refresh', { id: userData._id, random });

  // Refresh tokeni db'ye ekle:
  await User.findOneAndUpdate(
    { email: req.body.email },
    { refreshToken: refreshToken.token },
    { upsert: true },
    function(err, doc) {
      if (err) return res.send(500, {error: err});
      res.json({
        accessToken: accessToken.token,
        expiresIn: accessToken.expiresIn, // (sn)
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

  // db'den refresh tokeni getir:
  const refreshToken = userData.refreshToken;
  // header'dan acceess tokeni getir:
  const accessToken = req.header('x-access-token');
  // access tokeni coz:
  const decodedAccess = jwt.decode(accessToken, { complete: true });
  // refresh tokeni coz:
  const decodedRefresh = jwt.decode(refreshToken, { complete: true });

  // farkli bir cihazdan giris yapilmissa:
  if (decodedAccess.payload.iat !== decodedRefresh.payload.iat) {
    return res.status(403).json({
      message: 'Yor session is denied!'
    });
  }

  // refresh token expire olmamis ise degiskene ata ve devam et
  // expire olmus ise mesaj donerek islemi bitir
  try {
    const verifiedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    return res.status(403).json({
      message: 'Refresh token is denied!'
    });
  }

  // Random string olustur:
  const random = crypto.randomBytes(32).toString('hex');

  // access token expire olmamis ise degiskene ata ve devam et
  // expire olmus ise:
    // yeni bir access token ve refresh token olustur
    // refresh tokeni db'ye kaydet
  try {
    const verifiedAccess = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    return res.json({
      accessToken: accessToken.token,
      expiresIn: accessToken.expiresIn, // (sn)
      email,
      deneme: "1"
    });
  } catch {
    // Token olustur (access token):
    const accessToken = createToken('access', { id: userData._id, random });
    // Token olustur (refresh token):
    const refreshToken = createToken('refresh', { id: userData._id, random });

    // Refresh tokeni db'ye ekle:
    await User.findOneAndUpdate(
      { email },
      { refreshToken: refreshToken.token },
      { upsert: true },
      function(err, doc) {
        if (err) return res.send(500, {error: err});
        return res.json({
          accessToken: accessToken.token,
          expiresIn: accessToken.expiresIn, // (sn)
          email: doc.email,
          deneme: "2"
        });
      }
    );
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
    expiresIn = 150 // sn (2.5 min)
  }

  const token = jwt.sign({ _id: userId }, secret, { expiresIn });
  return { token, expiresIn }
}

module.exports = router;