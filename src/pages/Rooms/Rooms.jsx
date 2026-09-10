import { useEffect, useState } from "react";
import { useSpa } from "../../context/SpaContext";
import "./rooms.css";

function Rooms() {
  const {
    rooms,
    bookings,
    addRoom,
    deleteRoom,
  } = useSpa();

  const [currentTime, setCurrentTime] =
    useState(Date.now());

  const [showAddRoom, setShowAddRoom] =
    useState(false);

  const [roomName, setRoomName] =
    useState("");

  /* ================= LIVE TIMER ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================= ACTIVE BOOKING ================= */

  const getActiveBooking = (roomName) => {
    return bookings.find(
      (booking) =>
        booking.room === roomName &&
        booking.status === "In Service"
    );
  };

  /* ================= TIMER ================= */

  const getRemainingTime = (booking) => {
    if (!booking?.endAt) {
      return "--:--";
    }

    const difference =
      booking.endAt - currentTime;

    if (difference <= 0) {
      return "00:00";
    }

    const totalSeconds =
      Math.floor(difference / 1000);

    const hours =
      Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds =
      totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  /* ================= ADD ================= */

  const handleAddRoom = async () => {
    if (!roomName.trim()) {
      alert("Please enter room name");
      return;
    }

    const added = await addRoom(roomName);

    if (!added) {
      return;
    }

    setRoomName("");
    setShowAddRoom(false);
  };

  /* ================= DELETE ================= */

 const handleDelete = async (room) => {
  if (room.status === "Occupied") {
    alert(
      "Occupied room cannot be deleted."
    );
    return;
  }

  const confirmed = window.confirm(
    `Delete ${room.name}?`
  );

  if (!confirmed) return;

  const success = await deleteRoom(
    room.id
  );

  if (success) {
    alert("Room deleted successfully.");
  }
};

  const availableCount = rooms.filter(
    (room) => room.status === "Available"
  ).length;

  const occupiedCount = rooms.filter(
    (room) => room.status === "Occupied"
  ).length;

  return (
    <div className="rooms-page">
      {/* HEADER */}

      <div className="rooms-header">
        <div>
          <p className="rooms-label">
            ROOM MANAGEMENT
          </p>

          <h1>Rooms</h1>

          <p className="rooms-subtitle">
            Monitor treatment rooms and live
            occupancy.
          </p>
        </div>

        <button
          className="add-room-btn"
          onClick={() =>
            setShowAddRoom(true)
          }
        >
          <span>＋</span>
          Add Room
        </button>
      </div>

      {/* STATS */}

      <div className="room-stats">
        <div className="room-stat-card">
          <span>TOTAL ROOMS</span>
          <strong>{rooms.length}</strong>
          <p>Treatment rooms</p>
        </div>

        <div className="room-stat-card">
          <span>AVAILABLE</span>
          <strong>{availableCount}</strong>
          <p>Ready for sessions</p>
        </div>

        <div className="room-stat-card">
          <span>OCCUPIED</span>
          <strong>{occupiedCount}</strong>
          <p>Currently in use</p>
        </div>
      </div>

      {/* ROOM GRID */}

      <div className="rooms-grid">
        {rooms.map((room) => {
          const activeBooking =
            getActiveBooking(room.name);

          const occupied =
            room.status === "Occupied";

          return (
            <div
              className={`room-card ${
                occupied ? "occupied" : ""
              }`}
              key={room.id}
            >
              <div className="room-card-top">
                <div className="room-icon">
                  {String(room.name)
                    .replace(/\D/g, "")
                    .padStart(2, "0")}
                </div>

                <span
                  className={`room-status ${
                    occupied
                      ? "occupied"
                      : "available"
                  }`}
                >
                  <i></i>
                  {room.status}
                </span>
              </div>

              <h3>{room.name}</h3>

              {!occupied && (
                <div className="room-available-content">
                  <p>
                    Room is ready for a new
                    session.
                  </p>

                  <span>
                    Ready to assign
                  </span>
                </div>
              )}

              {occupied && activeBooking && (
                <div className="room-session-info">
                  <div>
                    <span>CLIENT</span>
                    <strong>
                      {activeBooking.clientName}
                    </strong>
                  </div>

                  <div>
                    <span>THERAPIST</span>
                    <strong>
                      {activeBooking.therapist}
                    </strong>
                  </div>

                  <div className="room-timer-area">
                    <span>
                      TIME REMAINING
                    </span>

                    <strong>
                      {getRemainingTime(
                        activeBooking
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <div className="room-card-footer">
                {occupied ? (
                  <span className="room-session-live">
                    <i></i>
                    Session in progress
                  </span>
                ) : (
                  <button
                    className="delete-room-btn"
                    onClick={() =>
                      handleDelete(room)
                    }
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD ROOM MODAL */}

      {showAddRoom && (
        <div
          className="room-modal-overlay"
          onClick={() =>
            setShowAddRoom(false)
          }
        >
          <div
            className="room-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="room-modal-header">
              <div>
                <p>ROOM MANAGEMENT</p>
                <h2>Add New Room</h2>
              </div>

              <button
                onClick={() =>
                  setShowAddRoom(false)
                }
              >
                ×
              </button>
            </div>

            <div className="room-form">
              <label>
                ROOM NAME
              </label>

              <input
                type="text"
                placeholder="Example: Room 05"
                value={roomName}
                onChange={(e) =>
                  setRoomName(e.target.value)
                }
                autoFocus
              />
            </div>

            <div className="room-modal-actions">
              <button
                className="room-cancel-btn"
                onClick={() =>
                  setShowAddRoom(false)
                }
              >
                Cancel
              </button>

              <button
                className="room-save-btn"
                onClick={handleAddRoom}
              >
                Add Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;