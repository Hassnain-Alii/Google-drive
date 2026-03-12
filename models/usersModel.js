const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    minLength: 3,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // contact: Number,
  profileImg: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("user", userSchema);
