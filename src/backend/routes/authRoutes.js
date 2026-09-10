const express = require("express");

const {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* ================= ADMIN ONLY ================= */

const adminOnly = (req, res, next) => {
  if (!req.admin || req.admin.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
};

/* ================= AUTH ROUTES ================= */

// Login remains public
router.post("/login", loginAdmin);

// Get currently logged-in user
router.get("/me", protect, getCurrentAdmin);

// Only logged-in admin can create another account
router.post(
  "/register",
  protect,
  adminOnly,
  registerAdmin
);

module.exports = router;