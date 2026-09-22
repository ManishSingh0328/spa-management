const Therapist = require("../models/Therapist");
const Booking = require("../models/Booking");

/* ================= GET ALL THERAPISTS ================= */

const getTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find().sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      data: therapists,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= ADD THERAPIST ================= */

const createTherapist = async (req, res) => {
  try {
    const { name, mobile, status } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name and mobile number are required.",
      });
    }

    const cleanName = name.trim();
    const cleanMobile = mobile.trim();

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10 digit mobile number.",
      });
    }

    const existingTherapist = await Therapist.findOne({
      mobile: cleanMobile,
    });

    if (existingTherapist) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered.",
      });
    }

    const therapist = await Therapist.create({
      name: cleanName,
      mobile: cleanMobile,
      status: status || "Available",
    });

    return res.status(201).json({
      success: true,
      message: "Therapist added successfully.",
      data: therapist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE THERAPIST ================= */

const updateTherapist = async (req, res) => {
  try {
    const { name, mobile, status } = req.body;

    const therapist = await Therapist.findById(req.params.id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found.",
      });
    }

    const cleanName = name ? name.trim() : therapist.name;
    const cleanMobile = mobile ? mobile.trim() : therapist.mobile;

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10 digit mobile number.",
      });
    }

    const duplicateMobile = await Therapist.findOne({
      mobile: cleanMobile,
      _id: { $ne: req.params.id },
    });

    if (duplicateMobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered.",
      });
    }

    therapist.name = cleanName;
    therapist.mobile = cleanMobile;

    if (status) {
      therapist.status = status;
    }

    await therapist.save();

    return res.status(200).json({
      success: true,
      message: "Therapist updated successfully.",
      data: therapist,
    });
  } catch (error) {
    console.error("Update Therapist Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE THERAPIST ================= */

const deleteTherapist = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found.",
      });
    }

    const activeBooking = await Booking.findOne({
      therapist: therapist.name,
      status: "In Service",
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message:
          "Busy therapist cannot be deleted during an active session.",
      });
    }

    await therapist.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Therapist deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= EXPORTS ================= */

module.exports = {
  getTherapists,
  createTherapist,
  updateTherapist,
  deleteTherapist,
};