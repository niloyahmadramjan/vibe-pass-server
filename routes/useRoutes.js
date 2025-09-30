const express = require('express')
const router = express.Router()
const multer = require('multer')

const {
  getUserInfo,
  updateMobile,
  verifyEmail,
  updateProfile,
  updatePreferences,
  changePin,
  deleteAccount,
  contactSupport,
  uploadProfileImage,
} = require('../controllers/userController.js')
const verifyToken = require('../middlewares/verifyToken.js')
const upload = multer({ storage: multer.memoryStorage() })



router.get('/info',verifyToken, getUserInfo)
router.put('/number', verifyToken, updateMobile)
router.post('/verify-email', verifyToken, verifyEmail)
router.put('/profile', verifyToken, updateProfile)
router.put('/preferences', verifyToken, updatePreferences)
router.put('/pin', verifyToken, changePin)
router.delete('/account', verifyToken, deleteAccount)
router.post('/support', verifyToken, contactSupport)
router.put('/image', verifyToken, upload.single('image'), uploadProfileImage)

module.exports = router
