// user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  hashedOtp: { type: String, required: true },
  countryCode: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
