const axios = require('axios')

const verifyGoogleAccessToken = async (token) => {
  try {
    // Verify and get user info directly from Google
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    return response.data // returns { email, name, picture, sub, etc. }
  } catch (error) {
    console.error(
      'Google token verification failed:',
      error.response?.data || error.message
    )
    return null
  }
}

module.exports = verifyGoogleAccessToken
