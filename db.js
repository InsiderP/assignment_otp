// db.js
const mongoose = require('mongoose');

async function connectToDB() {
  try {
    await mongoose.connect('mongodb://localhost/user-registration', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

module.exports = connectToDB;
