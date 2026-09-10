const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Therapist = require("../models/Therapist");
const Booking = require("../models/Booking");

/* ================= THERAPIST LOGIN ================= */

const loginTherapist = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number and password are required.",
      });
    }

    const therapist = await Therapist.findOne({
      mobile: mobile.trim(),
    });

    if (!therapist) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid mobile number or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      therapist.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid mobile number or password.",
      });
    }

    const token = jwt.sign(
      {
        id: therapist._id,
        role: "therapist",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        mobile: therapist.mobile,
      },
    });
  } catch (error) {
    console.error("Therapist Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ================= GET LOGGED IN THERAPIST ================= */

const getTherapistMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      therapist: {
        id: req.therapist._id,
        name: req.therapist.name,
        mobile: req.therapist.mobile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ================= GET ALL THERAPISTS ================= */

const getTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find()
      .select("-password")
      .sort({
        createdAt: 1,
      });

    res.status(200).json({
      success: true,
      data: therapists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= ADD THERAPIST ================= */

const createTherapist = async (req, res) => {
  try {
    const { name, mobile, password, status } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, mobile number and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanMobile = mobile.trim();

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10 digit mobile number.",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 4 characters.",
      });
    }

    const existingTherapist =
      await Therapist.findOne({
        mobile: cleanMobile,
      });

    if (existingTherapist) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const therapist = await Therapist.create({
  name: cleanName,
  mobile: cleanMobile,
  password: hashedPassword,
  status: status || "Available",
});

    const therapistData = therapist.toObject();
    delete therapistData.password;

    res.status(201).json({
      success: true,
      message:
        "Therapist added successfully.",
      data: therapistData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE THERAPIST ================= */

const updateTherapist = async (req, res) => {
  try {
    const { name, mobile, password, status } = req.body;

    const therapist = await Therapist.findById(
      req.params.id
    );

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found.",
      });
    }

    const cleanName = name
      ? name.trim()
      : therapist.name;

    const cleanMobile = mobile
      ? mobile.trim()
      : therapist.mobile;

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10 digit mobile number.",
      });
    }

    const duplicateMobile =
      await Therapist.findOne({
        mobile: cleanMobile,
        _id: { $ne: req.params.id },
      });

    if (duplicateMobile) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number already registered.",
      });
    }

    therapist.name = cleanName;
    therapist.mobile = cleanMobile;
    if (status) {
  therapist.status = status;
}

    /* ================= PASSWORD ================= */

    if (password && password.trim()) {
      if (password.trim().length < 4) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 4 characters.",
        });
      }

      therapist.password = await bcrypt.hash(
        password.trim(),
        10
      );
    } else if (!therapist.password) {
      return res.status(400).json({
        success: false,
        message:
          "Please set a password for this therapist.",
      });
    }

    await therapist.save();

    const therapistData =
      therapist.toObject();

    delete therapistData.password;

    return res.status(200).json({
      success: true,
      message:
        "Therapist updated successfully.",
      data: therapistData,
    });
  } catch (error) {
    console.error(
      "Update Therapist Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ================= DELETE THERAPIST ================= */

const deleteTherapist = async (req, res) => {
  try {
    const therapist = await Therapist.findById(
      req.params.id
    );

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

    res.status(200).json({
      success: true,
      message:
        "Therapist deleted successfully.",
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
  loginTherapist,
  getTherapistMe,
  getTherapists,
  createTherapist,
  updateTherapist,
  deleteTherapist,
};