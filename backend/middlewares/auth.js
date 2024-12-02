const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).send('É necessário estar autenticado para acessar esta rota');
  }

  const cleanToken = token.replace('Bearer ', '');

  try {
    const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send('Invalid Token');
  }
};

module.exports = authMiddleware;