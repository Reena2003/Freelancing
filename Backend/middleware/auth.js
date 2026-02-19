const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token missing" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    req.userId = decoded.id  // Controller mein req.userId use hota hai
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}

module.exports = authMiddleware
