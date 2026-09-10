const mongoose = require("mongoose");

const therapistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 4,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Therapist",
  therapistSchema
);