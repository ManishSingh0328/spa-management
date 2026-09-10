const Booking = require("../models/Booking");
const Therapist = require("../models/Therapist");
const Room = require("../models/Room");

// ================= CREATE BOOKING =================

const createBooking = async (req, res) => {
  try {
    const {
      therapist,
      room,
      date,
      time,
      duration,
    } = req.body;

    // Required fields validation
    if (
      !therapist ||
      !room ||
      !date ||
      !time ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Therapist, room, date, time and duration are required.",
      });
    }

    // Check therapist exists
    const therapistExists =
      await Therapist.findOne({
        name: therapist,
      });

    if (!therapistExists) {
      return res.status(400).json({
        success: false,
        message:
          "Selected therapist does not exist.",
      });
    }

    // Check room exists
    const roomExists =
      await Room.findOne({
        name: room,
      });

    if (!roomExists) {
      return res.status(400).json({
        success: false,
        message:
          "Selected room does not exist.",
      });
    }

    // Booking start and end time
    const bookingStart = new Date(
      `${date}T${time}:00`
    );

    const bookingEnd = new Date(
      bookingStart.getTime() +
        Number(duration) * 60 * 1000
    );

    // Find bookings using same therapist or room
    const sameDayBookings =
      await Booking.find({
        date,
        status: {
          $in: ["Upcoming", "In Service"],
        },
        $or: [
          { therapist },
          { room },
        ],
      });

    // Check time conflict
    const hasConflict =
      sameDayBookings.some(
        (existingBooking) => {
          if (
            !existingBooking.time ||
            !existingBooking.duration
          ) {
            return false;
          }

          const existingStart =
            new Date(
              `${existingBooking.date}T${existingBooking.time}:00`
            );

          const existingEnd =
            new Date(
              existingStart.getTime() +
                Number(
                  existingBooking.duration
                ) *
                  60 *
                  1000
            );

          return (
            bookingStart < existingEnd &&
            bookingEnd > existingStart
          );
        }
      );

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message:
          "Therapist or room is already booked for this time.",
      });
    }

    // Create booking
    const booking =
      await Booking.create(req.body);

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error(
      "Create Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= GET BOOKINGS =================

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= START SESSION =================

const startBookingSession = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "Upcoming") {
      return res.status(400).json({
        success: false,
        message:
          "Only upcoming booking can be started",
      });
    }

    const durationMinutes =
      parseInt(booking.duration) || 60;

    const startedAt = new Date();

    const endAt = new Date(
      startedAt.getTime() +
        durationMinutes * 60 * 1000
    );

    booking.status = "In Service";
    booking.startedAt = startedAt;
    booking.endAt = endAt;
    booking.completedAt = null;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Session started successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE UPCOMING =================

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "Upcoming") {
      return res.status(400).json({
        success: false,
        message:
          "Only upcoming bookings can be edited",
      });
    }

    const {
      therapist,
      room,
      date,
      time,
      duration,
    } = req.body;

    const nextTherapist =
      therapist || booking.therapist;

    const nextRoom =
      room || booking.room;

    const nextDate =
      date || booking.date;

    const nextTime =
      time || booking.time;

    const nextDuration =
      duration || booking.duration;

    const bookingStart = new Date(
      `${nextDate}T${nextTime}:00`
    );

    const bookingEnd = new Date(
      bookingStart.getTime() +
        Number(nextDuration) * 60 * 1000
    );

    const sameDayBookings =
      await Booking.find({
        _id: { $ne: booking._id },
        date: nextDate,
        status: {
          $in: ["Upcoming", "In Service"],
        },
        $or: [
          { therapist: nextTherapist },
          { room: nextRoom },
        ],
      });

    const hasConflict =
      sameDayBookings.some(
        (existingBooking) => {
          if (
            !existingBooking.time ||
            !existingBooking.duration
          ) {
            return false;
          }

          const existingStart =
            new Date(
              `${existingBooking.date}T${existingBooking.time}:00`
            );

          const existingEnd =
            new Date(
              existingStart.getTime() +
                Number(
                  existingBooking.duration
                ) *
                  60 *
                  1000
            );

          return (
            bookingStart < existingEnd &&
            bookingEnd > existingStart
          );
        }
      );

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message:
          "Therapist or room is already booked for this time.",
      });
    }

    booking.therapist = nextTherapist;
    booking.room = nextRoom;
    booking.date = nextDate;
    booking.time = nextTime;
    booking.duration = nextDuration;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= SWITCH ACTIVE SESSION =================

const switchActiveSession = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "In Service") {
      return res.status(400).json({
        success: false,
        message:
          "Only active sessions can be changed",
      });
    }

    const { therapist, room } = req.body;

    const nextTherapist =
      therapist || booking.therapist;

    const nextRoom =
      room || booking.room;

    const activeConflict =
      await Booking.findOne({
        _id: { $ne: booking._id },
        status: "In Service",
        $or: [
          { therapist: nextTherapist },
          { room: nextRoom },
        ],
      });

    if (activeConflict) {
      return res.status(409).json({
        success: false,
        message:
          "Selected therapist or room is already in an active session.",
      });
    }

    booking.therapist = nextTherapist;
    booking.room = nextRoom;

    // Timer continue karega
    // startedAt / endAt same rahenge

    await booking.save();

    res.status(200).json({
      success: true,
      message:
        "Active session updated successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= COMPLETE SESSION =================

const completeBookingSession = async (
  req,
  res
) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "In Service") {
      return res.status(400).json({
        success: false,
        message:
          "Only active sessions can be completed",
      });
    }

    booking.status = "Completed";
    booking.completedAt = new Date();
    booking.endAt = null;

    await booking.save();

    res.status(200).json({
      success: true,
      message:
        "Session completed successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= THERAPIST ASSIGNED BOOKINGS =================

const getTherapistBookings = async (req, res) => {
  try {
    const therapist = req.therapist;

    if (!therapist) {
      return res.status(401).json({
        success: false,
        message: "Therapist not authorized.",
      });
    }

    // Local date: YYYY-MM-DD
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    const todayDate = `${year}-${month}-${day}`;

    const bookings = await Booking.find({
      therapist: therapist.name,
      date: todayDate,
      status: {
        $in: ["Upcoming", "In Service"],
      },
    }).sort({
      time: 1,
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(
      "Therapist Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= ACCEPT THERAPIST ASSIGNMENT =================

const acceptTherapistBooking = async (req, res) => {
  try {
    const therapist = req.therapist;

    if (!therapist) {
      return res.status(401).json({
        success: false,
        message: "Therapist not authorized.",
      });
    }

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.therapist !== therapist.name) {
      return res.status(403).json({
        success: false,
        message:
          "This booking is not assigned to you.",
      });
    }

    if (booking.status !== "Upcoming") {
      return res.status(400).json({
        success: false,
        message:
          "Only upcoming bookings can be accepted.",
      });
    }

    if (booking.therapistAccepted) {
      return res.status(200).json({
        success: true,
        message:
          "Assignment already accepted.",
        data: booking,
      });
    }

    booking.therapistAccepted = true;
    booking.acceptedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Assignment accepted successfully.",
      data: booking,
    });
  } catch (error) {
    console.error(
      "Accept Therapist Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= THERAPIST START SESSION =================

const startTherapistSession = async (req, res) => {
  try {
    const therapist = req.therapist;

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.therapist !== therapist.name) {
      return res.status(403).json({
        success: false,
        message:
          "This booking is not assigned to you.",
      });
    }

    if (!booking.therapistAccepted) {
      return res.status(400).json({
        success: false,
        message:
          "Please accept assignment first.",
      });
    }

    if (booking.status !== "Upcoming") {
      return res.status(400).json({
        success: false,
        message:
          "Only upcoming session can be started.",
      });
    }

    const durationMinutes =
      parseInt(booking.duration) || 60;

    const startedAt = new Date();

    const endAt = new Date(
      startedAt.getTime() +
        durationMinutes * 60 * 1000
    );

    booking.status = "In Service";
    booking.startedAt = startedAt;
    booking.endAt = endAt;
    booking.completedAt = null;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Session started successfully.",
      data: booking,
    });
  } catch (error) {
    console.error(
      "Therapist Start Session Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ================= THERAPIST COMPLETE SESSION ================= */

const completeTherapistSession = async (req, res) => {
  try {
    const therapist = req.therapist;

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Therapist can complete only own booking
    if (booking.therapist !== therapist.name) {
      return res.status(403).json({
        success: false,
        message:
          "This booking is not assigned to you.",
      });
    }

    // Only running session can be completed
    if (booking.status !== "In Service") {
      return res.status(400).json({
        success: false,
        message:
          "Only running session can be completed.",
      });
    }

    booking.status = "Completed";
    booking.completedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Session completed successfully.",
      data: booking,
    });
  } catch (error) {
    console.error(
      "Therapist Complete Session Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= EXPORTS =================

module.exports = {
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
};