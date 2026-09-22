const express = require("express");

const {
  getTherapists,
  createTherapist,
  updateTherapist,
  deleteTherapist,
} = require("../controllers/therapistController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

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