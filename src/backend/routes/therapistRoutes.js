const express = require("express");

const {
  loginTherapist,
  getTherapistMe,
  getTherapists,
  createTherapist,
  updateTherapist,
  deleteTherapist,
} = require("../controllers/therapistController");

const protect = require("../middleware/authMiddleware");

const protectTherapist = require(
  "../middleware/therapistAuthMiddleware"
);

const router = express.Router();

/* ================= THERAPIST LOGIN - PUBLIC ================= */

router.post("/login", loginTherapist);

/* ================= THERAPIST PROFILE ================= */

router.get(
  "/me",
  protectTherapist,
  getTherapistMe
);

/* ================= ADMIN PROTECTED ROUTES ================= */

router.use(protect);

/* GET ALL THERAPISTS */

router.get("/", getTherapists);

/* ADD THERAPIST */

router.post("/", createTherapist);

/* UPDATE THERAPIST */

router.patch("/:id", updateTherapist);

/* DELETE THERAPIST */

router.delete("/:id", deleteTherapist);

module.exports = router;