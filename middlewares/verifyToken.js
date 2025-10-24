const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    // 🟢 1️⃣ Try verifying your own custom JWT (local login)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    // console.log('✅ Verified Custom JWT:', decoded)
    return next()
  } catch (err1) {
    // 🔵 2️ Try verifying NextAuth token manually
    try {
      const decodedNextAuth = jwt.verify(token, process.env.NEXTAUTH_SECRET)

      if (!decodedNextAuth) {
        return res.status(403).json({ message: 'Invalid NextAuth token' })
      }

      req.user = decodedNextAuth
      // console.log('✅ Verified NextAuth JWT:', decodedNextAuth)
      return next()
    } catch (err2) {
      console.error('❌ Token verification failed:', err2.message)
      return res.status(403).json({ message: 'Invalid or expired token' })
    }
  }
}

module.exports = verifyToken
