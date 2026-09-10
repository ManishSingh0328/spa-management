const jwt = require("jsonwebtoken");
const Therapist = require("../models/Therapist");

const protectTherapist = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "therapist") {
      return res.status(401).json({
        message: "Invalid therapist session.",
      });
    }

    const therapist = await Therapist.findById(
      decoded.id
    ).select("-password");

    if (!therapist) {
      return res.status(401).json({
        message: "Therapist account no longer exists.",
      });
    }

    req.therapist = therapist;

    next();
  } catch (error) {
    return res.status(401).json({
      message:
        "Session expired or invalid. Please login again.",
    });
  }
};

module.exports = protectTherapist;