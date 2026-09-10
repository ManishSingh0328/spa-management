const Room = require("../models/Room");
const Booking = require("../models/Booking");

/* ================= GET ALL ROOMS ================= */

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= ADD ROOM ================= */

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room name is required.",
      });
    }

    const cleanName = name.trim();

    const existingRoom = await Room.findOne({
      name: cleanName,
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room already exists.",
      });
    }

    const room = await Room.create({
      name: cleanName,
    });

    res.status(201).json({
      success: true,
      message: "Room added successfully.",
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE ROOM ================= */

const updateRoom = async (req, res) => {
  try {
    const { name } = req.body;

    const room = await Room.findById(
      req.params.id
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    const cleanName = name
      ? name.trim()
      : room.name;

    const duplicateRoom = await Room.findOne({
      name: cleanName,
      _id: { $ne: req.params.id },
    });

    if (duplicateRoom) {
      return res.status(400).json({
        success: false,
        message: "Room already exists.",
      });
    }

    room.name = cleanName;

    await room.save();

    res.status(200).json({
      success: true,
      message: "Room updated successfully.",
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE ROOM ================= */

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(
      req.params.id
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    const activeBooking = await Booking.findOne({
      room: room.name,
      status: "In Service",
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message:
          "Occupied room cannot be deleted during an active session.",
      });
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: "Room deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= EXPORTS ================= */

module.exports = {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};