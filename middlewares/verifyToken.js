const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })

  const token = authHeader.split(' ')[1]

  try {
    // Try custom JWT first
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    return next()
  } catch (err1) {
    try {
      // Try NextAuth JWT
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET)
      req.user = decoded
      return next()
    } catch (err2) {
      return res.status(403).json({ message: 'Invalid or expired token' })
    }
  }
}
module.exports = verifyToken
