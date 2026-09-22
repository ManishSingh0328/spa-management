const express = require("express");

const {
  createBooking,
  getBookings,
  startBookingSession,
  updateBooking,
  switchActiveSession,
  completeBookingSession,
  deleteBooking,
  getPublicSession,
  startPublicSession,
  completePublicSession,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* ================= PUBLIC SESSION ROUTES ================= */

// Get Session Details
router.get(
  "/public/:token",
  getPublicSession
);

// Start Session
router.patch(
  "/public/:token/start",
  startPublicSession
);

// Complete Session
router.patch(
  "/public/:token/complete",
  completePublicSession
);

/* ================= ADMIN PROTECTED ROUTES ================= */

router.use(protect);

// Create Booking
router.post("/", createBooking);

// Get All Bookings
router.get("/", getBookings);

// Start Session
router.patch("/:id/start", startBookingSession);

// Change Therapist / Room During Active Session
router.patch("/:id/switch", switchActiveSession);

// Complete Session
router.patch("/:id/complete", completeBookingSession);

// Edit Upcoming Booking
router.patch("/:id", updateBooking);

// Delete Upcoming Booking
router.delete("/:id", deleteBooking);

module.exports = router;