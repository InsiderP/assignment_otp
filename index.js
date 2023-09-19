// server.js
const express = require('express');
const connectToDB = require('./db');
const ipinfo = require('ipinfo');
const twilio = require('twilio');
const bcrypt = require('bcrypt');
const User = require('./user');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/register', async (req, res) => {
  const { phoneNumber, otp } = req.body;
  const ipAddress = req.ip;

  // Validate IP using ipinfo module
  const ipDetails = await ipinfo(ipAddress);
  const countryCode = ipDetails.country;

  // Send OTP using Twilio
  const twilioClient = twilio('YOUR_TWILIO_ACCOUNT_SID', 'YOUR_TWILIO_AUTH_TOKEN');
  //Replace 'YOUR_TWILIO_ACCOUNT_SID', 'YOUR_TWILIO_AUTH_TOKEN', and 'YOUR_TWILIO_PHONE_NUMBER' with your actual Twilio credentials.
  twilioClient.messages
    .create({
      body: `Your OTP is: ${otp}`,
      from: 'YOUR_TWILIO_PHONE_NUMBER',
      to: phoneNumber,
    })
    .then(async (message) => {
      // Hash and save OTP in the database
      const hashedOtp = await bcrypt.hash(otp, 10);
      await connectToDB();
      const user = new User({ phoneNumber, hashedOtp, countryCode });
      await user.save();
      res.send('OTP sent and user registered successfully.');
    })
    .catch((error) => {
      console.error('Error sending OTP:', error);
      res.status(500).send('Error sending OTP.');
    });
});

app.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;

  // Find the user in the database
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    res.status(404).send('User not found.');
    return;
  }

  // Compare entered OTP with the hashed OTP in the database
  const otpMatch = await bcrypt.compare(otp, user.hashedOtp);

  if (otpMatch) {
    res.send('OTP is valid. User registered.');
  } else {
    res.status(401).send('Invalid OTP.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectToDB();
});
