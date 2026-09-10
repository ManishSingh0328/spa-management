const express = require("express");

const {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* ================= PROTECT ALL ROOM ROUTES ================= */

router.use(protect);

/* GET ALL ROOMS */

router.get("/", getRooms);

/* ADD ROOM */

router.post("/", createRoom);

/* UPDATE ROOM */

router.patch("/:id", updateRoom);

/* DELETE ROOM */

router.delete("/:id", deleteRoom);

module.exports = router;