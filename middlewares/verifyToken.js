const jwt = require('jsonwebtoken')
const { getToken } = require('next-auth/jwt')

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })

  const token = authHeader.split(' ')[1]

  //  Try custom JWT first
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    return next()
  } catch (err1) {
    // Try NextAuth JWT
    try {
      const nextAuthUser = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (!nextAuthUser)
        return res.status(403).json({ message: 'Invalid or expired token' })

      req.user = nextAuthUser
      return next()
    } catch (err2) {
      console.error('NextAuth verify error:', err2)
      return res.status(403).json({ message: 'Invalid or expired token' })
    }
  }
}

module.exports = verifyToken
