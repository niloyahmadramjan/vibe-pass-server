let otpStore;
const otp = Math.floor(100000 + Math.random() * 900000).toString()
const email = "test"
otpStore[email] = otp

console.log(otpStore)