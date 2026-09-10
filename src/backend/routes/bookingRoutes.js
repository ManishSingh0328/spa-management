const express = require("express");

const {

  createBooking,

  getBookings,

  startBookingSession,

  updateBooking,

  switchActiveSession,

  completeBookingSession,

  getTherapistBookings,

  acceptTherapistBooking,
  startTherapistSession,
  completeTherapistSession,

} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");

const protectTherapist = require(

  "../middleware/therapistAuthMiddleware"

);

const router = express.Router();

/* ================= THERAPIST ROUTES ================= */

// Logged-in therapist assigned bookings

router.get(

  "/therapist/my-bookings",

  protectTherapist,

  getTherapistBookings

);

// Accept therapist assignment

router.patch(

  "/therapist/:id/accept",

  protectTherapist,

  acceptTherapistBooking

);
router.patch(
  "/therapist/:id/start",
  protectTherapist,
  startTherapistSession
);
// Complete therapist session

router.patch(
  "/therapist/:id/complete",
  protectTherapist,
  completeTherapistSession
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

module.exports = router;