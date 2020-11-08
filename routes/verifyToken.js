const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
	const token = req.header('auth-token');
	
	if (!token) return res.status(401).json({
		message: 'Access Denied!'
	});

	try {
		const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		// dogrulanirsa jwt.sign metodunda verdigimiz "_id"yi doner
		req.user = verified;
		next();
	} catch (err) {
		res.status(400).json({
			message: 'Invalid Token!'
		});
	}
}