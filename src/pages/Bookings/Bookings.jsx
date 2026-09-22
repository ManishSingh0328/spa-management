import { useEffect, useState } from "react";
import { useSpa } from "../../context/SpaContext";
import NewBooking from "../../components/NewBooking/newbooking";
import "./bookings.css";
import { apiFetch } from "../../utils/api";

function Bookings() {
  const {
  bookings,
  therapists,
  rooms,
  updateBooking,
  deleteBooking,
  startSession,
  switchActiveSession,
  completeSession,
} = useSpa();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [dateFilter, setDateFilter] =
    useState("");

  const [
    showBookingForm,
    setShowBookingForm,
  ] = useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(Date.now());

  /* ================= EDIT / CHANGE SESSION ================= */

  const [
    editingBooking,
    setEditingBooking,
  ] = useState(null);

  const [
    editTherapist,
    setEditTherapist,
  ] = useState("");

  const [editRoom, setEditRoom] =
    useState("");

  const [editDate, setEditDate] =
    useState("");

  const [editTime, setEditTime] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  /* ================= LIVE TIMER ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================= FILTER BOOKINGS ================= */

  const filteredBookings = bookings.filter(
    (booking) => {
      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        booking.clientName
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.mobile?.includes(searchValue) ||
        booking.therapist
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        booking.status === statusFilter;

      const matchesDate =
        !dateFilter ||
        booking.date === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    }
  );

  /* ================= COUNTS ================= */

  const totalBookings = bookings.length;

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "Upcoming"
  ).length;

  const inServiceBookings = bookings.filter(
    (booking) =>
      booking.status === "In Service"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "Completed"
  ).length;

  /* ================= TIMER ================= */

  const getRemainingTime = (booking) => {
    if (!booking.endAt) {
      return "--:--";
    }

    const difference =
      booking.endAt - currentTime;

    if (difference <= 0) {
      return "00:00";
    }

    const totalSeconds = Math.floor(
      difference / 1000
    );

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

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

  /* ================= START SESSION ================= */

  const handleStart = (booking) => {
    const confirmed = window.confirm(
      `Start session for ${booking.clientName}?`
    );

    if (!confirmed) {
      return;
    }

    startSession(booking.id);
  };

  /* ================= COMPLETE SESSION ================= */

  const handleComplete = (booking) => {
    const confirmed = window.confirm(
      `Complete session for ${booking.clientName}?`
    );

    if (!confirmed) {
      return;
    }

    completeSession(booking.id);
  };
  /* ================= DELETE BOOKING ================= */

const handleDelete = async (booking) => {
  const confirmed = window.confirm(
    `Delete booking for ${booking.clientName}?`
  );

  if (!confirmed) {
    return;
  }

  const success = await deleteBooking(
    booking.id
  );

  if (success) {
    alert("Booking deleted successfully.");
  }
};
  /* ================= OPEN EDIT UPCOMING ================= */

  const handleEdit = (booking) => {
    if (booking.status !== "Upcoming") {
      return;
    }

    setEditingBooking(booking);
    setEditTherapist(
      booking.therapist || ""
    );
    setEditRoom(booking.room || "");
    setEditDate(booking.date || "");
    setEditTime(booking.time || "");
  };

  /* ================= OPEN ACTIVE CHANGE ================= */

  const handleChangeSession = (booking) => {
    if (booking.status !== "In Service") {
      return;
    }

    setEditingBooking(booking);
    setEditTherapist(
      booking.therapist || ""
    );
    setEditRoom(booking.room || "");
    setEditDate(booking.date || "");
    setEditTime(booking.time || "");
  };

  /* ================= CLOSE MODAL ================= */

  const closeEdit = () => {
    if (savingEdit) return;

    setEditingBooking(null);
    setEditTherapist("");
    setEditRoom("");
    setEditDate("");
    setEditTime("");
  };

  /* ================= TIME HELPERS ================= */

  const getMinutesFromTime = (
    timeValue
  ) => {
    if (!timeValue) return 0;

    const [hours, minutes] =
      timeValue.split(":");

    return (
      Number(hours) * 60 +
      Number(minutes)
    );
  };

  const getBookingDuration = (
    booking
  ) => {
    return (
      parseInt(booking.duration) || 60
    );
  };

  /* ================= UPCOMING CONFLICT ================= */

  const hasEditConflict = () => {
    if (!editingBooking) {
      return false;
    }

    if (
      editingBooking.status !==
      "Upcoming"
    ) {
      return false;
    }

    const newStart =
      getMinutesFromTime(editTime);

    const newEnd =
      newStart +
      getBookingDuration(
        editingBooking
      );

    return bookings.some((booking) => {
      if (
        booking.id === editingBooking.id
      ) {
        return false;
      }

      if (
        booking.status === "Completed"
      ) {
        return false;
      }

      if (booking.date !== editDate) {
        return false;
      }

      const sameTherapist =
        booking.therapist ===
        editTherapist;

      const sameRoom =
        booking.room === editRoom;

      if (
        !sameTherapist &&
        !sameRoom
      ) {
        return false;
      }

      const existingStart =
        getMinutesFromTime(
          booking.time
        );

      const existingEnd =
        existingStart +
        getBookingDuration(booking);

      return (
        newStart < existingEnd &&
        newEnd > existingStart
      );
    });
  };

  /* ================= SAVE ================= */

  const handleSaveEdit = async () => {
    if (!editingBooking) {
      return;
    }

    /* ===== ACTIVE SESSION CHANGE ===== */

    if (
      editingBooking.status ===
      "In Service"
    ) {
      if (
        !editTherapist ||
        !editRoom
      ) {
        alert(
          "Please select therapist and room."
        );
        return;
      }

      const selectedTherapist =
        therapists.find(
          (therapist) =>
            therapist.name ===
            editTherapist
        );

      const selectedRoom =
        rooms.find(
          (room) =>
            room.name === editRoom
        );

      const therapistChanged =
        editTherapist !==
        editingBooking.therapist;

      const roomChanged =
        editRoom !==
        editingBooking.room;

      if (
        therapistChanged &&
        selectedTherapist?.status ===
          "Busy"
      ) {
        alert(
          `${editTherapist} is currently busy.`
        );
        return;
      }

      if (
        roomChanged &&
        selectedRoom?.status ===
          "Occupied"
      ) {
        alert(
          `${editRoom} is currently occupied.`
        );
        return;
      }

      if (
        !therapistChanged &&
        !roomChanged
      ) {
        alert(
          "Please change therapist or room."
        );
        return;
      }

      try {
        setSavingEdit(true);

        const success =
          await switchActiveSession(
            editingBooking.id,
            editTherapist,
            editRoom
          );

        if (!success) {
          return;
        }

        setEditingBooking(null);
        setEditTherapist("");
        setEditRoom("");
        setEditDate("");
        setEditTime("");

        alert(
          "Active session changed successfully."
        );
      } finally {
        setSavingEdit(false);
      }

      return;
    }

    /* ===== UPCOMING BOOKING EDIT ===== */

    if (
      editingBooking.status !==
      "Upcoming"
    ) {
      return;
    }

    if (
      !editTherapist ||
      !editRoom ||
      !editDate ||
      !editTime
    ) {
      alert(
        "Please select therapist, room, date and time."
      );
      return;
    }

    const selectedTherapist =
      therapists.find(
        (therapist) =>
          therapist.name ===
          editTherapist
      );

    const selectedRoom = rooms.find(
      (room) =>
        room.name === editRoom
    );

    const therapistChanged =
      editTherapist !==
      editingBooking.therapist;

    const roomChanged =
      editRoom !==
      editingBooking.room;

    if (
      therapistChanged &&
      selectedTherapist?.status ===
        "Busy"
    ) {
      alert(
        `${editTherapist} is currently busy.`
      );
      return;
    }

    if (
      roomChanged &&
      selectedRoom?.status ===
        "Occupied"
    ) {
      alert(
        `${editRoom} is currently occupied.`
      );
      return;
    }

    if (hasEditConflict()) {
      alert(
        "Selected therapist or room already has another booking at this time."
      );
      return;
    }

    try {
      setSavingEdit(true);

      const response = await apiFetch(
  `/api/bookings/${editingBooking.id}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      therapist: editTherapist,
      room: editRoom,
      date: editDate,
      time: editTime,
    }),
  }
);

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Failed to update booking."
        );
        return;
      }

      updateBooking(result.data);

      setEditingBooking(null);
      setEditTherapist("");
      setEditRoom("");
      setEditDate("");
      setEditTime("");

      alert(
        "Booking updated successfully."
      );
    } catch (error) {
      console.error(
        "Update Booking Error:",
        error
      );

      alert(
        "Backend server connection failed."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* ================= OPTIONS ================= */

  const editTherapistOptions =
    therapists.filter(
      (therapist) => {
        if (!editingBooking) {
          return false;
        }

        return (
          therapist.status ===
            "Available" ||
          therapist.name ===
            editingBooking.therapist
        );
      }
    );

  const editRoomOptions =
    rooms.filter((room) => {
      if (!editingBooking) {
        return false;
      }

      return (
        room.status ===
          "Available" ||
        room.name ===
          editingBooking.room
      );
    });

  /* ================= AMOUNT ================= */

  const formatAmount = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-IN");
  };

  /* ================= DATE ================= */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(
      `${dateValue}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const isActiveEdit =
    editingBooking?.status ===
    "In Service";

  return (
    <div className="bookings-page">
      {/* ================= HEADER ================= */}

      <div className="bookings-header">
        <div>
          <p className="bookings-label">
            BOOKING MANAGEMENT
          </p>

          <h1>Bookings</h1>

          <p className="bookings-subtitle">
            Manage appointments, sessions
            and payments.
          </p>
        </div>

        <button
          className="add-booking-btn"
          onClick={() =>
            setShowBookingForm(true)
          }
        >
          <span>＋</span> New Booking
        </button>
      </div>

      {/* ================= STATS ================= */}

      <div className="booking-stats">
        <div className="booking-stat-card">
          <span>TOTAL BOOKINGS</span>
          <strong>
            {totalBookings}
          </strong>
          <p>All appointments</p>
        </div>

        <div className="booking-stat-card">
          <span>UPCOMING</span>
          <strong>
            {upcomingBookings}
          </strong>
          <p>Scheduled sessions</p>
        </div>

        <div className="booking-stat-card">
          <span>IN SERVICE</span>
          <strong>
            {inServiceBookings}
          </strong>
          <p>Live sessions</p>
        </div>

        <div className="booking-stat-card">
          <span>COMPLETED</span>
          <strong>
            {completedBookings}
          </strong>
          <p>Finished sessions</p>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="bookings-card">
        <div className="bookings-toolbar">
          <div className="bookings-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search client, mobile or therapist..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <div className="booking-filters">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Upcoming">
                Upcoming
              </option>

              <option value="In Service">
                In Service
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value
                )
              }
            />

            {(search ||
              statusFilter !== "All" ||
              dateFilter) && (
              <button
                className="clear-booking-filter"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "All"
                  );
                  setDateFilter("");
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>CLIENT NAME</th>
                <th>SERVICE</th>
                <th>THERAPIST</th>
                <th>ROOM</th>
                <th>DURATION</th>
                <th>STATUS</th>
                <th>AMOUNT PAID</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map(
                (booking, index) => (
                  <tr key={booking.id}>
                    <td className="booking-serial">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </td>

                    {/* CLIENT */}

                    <td>
                      <div className="booking-client">
                        <div className="booking-client-avatar">
                          {booking.clientName
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {
                              booking.clientName
                            }
                          </strong>

                          <span>
                            {booking.mobile}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SERVICE */}

                    <td>
                      <strong className="booking-service-name">
                        {booking.service}
                      </strong>

                      <span className="booking-date-small">
                        {formatDate(
                          booking.date
                        )}
                      </span>
                    </td>

                    {/* THERAPIST */}

                    <td>
                      {booking.therapist}
                    </td>

                    {/* ROOM */}

                    <td>
                      <span className="booking-room-badge">
                        {booking.room}
                      </span>
                    </td>

                    {/* DURATION */}

                    <td>
                      {booking.duration}
                    </td>

                    {/* STATUS */}

                    <td>
                      {booking.status ===
                      "In Service" ? (
                        <div className="booking-live-status">
                          <span className="booking-status in-service">
                            In Service
                          </span>

                          <strong>
                            {getRemainingTime(
                              booking
                            )}
                          </strong>
                        </div>
                      ) : (
                        <span
                          className={`booking-status ${
                            booking.status ===
                            "Completed"
                              ? "completed"
                              : "upcoming"
                          }`}
                        >
                          {booking.status}
                        </span>
                      )}
                    </td>

                    {/* PAYMENT */}

                    <td>
                      <div className="booking-payment">
                        <strong>
                          ₹
                          {formatAmount(
                            booking.amount
                          )}
                        </strong>

                        <span>
                          {booking.paymentMode ||
                            "—"}
                        </span>
                      </div>
                    </td>

                    {/* ACTION */}

                    <td>
                      {booking.status ===
                        "Upcoming" && (
                        <div className="booking-action-buttons">
                          <button
                            className="edit-booking-btn"
                            onClick={() =>
                              handleEdit(
                                booking
                              )
                            }
                          >
                            Edit
                          </button>
                          <button
  className="delete-booking-btn"
  onClick={() =>
    handleDelete(booking)
  }
>
  Delete
</button>
                        </div>
                      )}

                      {booking.status ===
                        "In Service" && (
                        <div className="booking-action-buttons">
                          <button
                            className="edit-booking-btn"
                            onClick={() =>
                              handleChangeSession(
                                booking
                              )
                            }
                          >
                            Change
                          </button>

                          <button
                            className="complete-session-btn"
                            onClick={() =>
                              handleComplete(
                                booking
                              )
                            }
                          >
                            Complete
                          </button>
                        </div>
                      )}

                      {booking.status ===
                        "Completed" && (
                        <span className="booking-done-text">
                          ✓ Done
                        </span>
                      )}
                    </td>
                  </tr>
                )
              )}

              {filteredBookings.length ===
                0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="no-bookings"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= NEW BOOKING ================= */}

      <NewBooking
        isOpen={showBookingForm}
        onClose={() =>
          setShowBookingForm(false)
        }
      />

      {/* ================= EDIT / CHANGE MODAL ================= */}

      {editingBooking && (
        <div
          className="edit-booking-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeEdit();
            }
          }}
        >
          <div className="edit-booking-modal">
            <div className="edit-booking-header">
              <div>
                <span>
                  {isActiveEdit
                    ? "ACTIVE SESSION"
                    : "BOOKING MANAGEMENT"}
                </span>

                <h2>
                  {isActiveEdit
                    ? "Change Session"
                    : "Edit Booking"}
                </h2>

                <p>
                  {isActiveEdit
                    ? "Change therapist or room without restarting the timer."
                    : "Change therapist, room or appointment time."}
                </p>
              </div>

              <button
                type="button"
                className="edit-booking-close"
                onClick={closeEdit}
              >
                ×
              </button>
            </div>

            <div className="edit-booking-client-info">
              <div className="edit-booking-avatar">
                {editingBooking.clientName
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {
                    editingBooking.clientName
                  }
                </strong>

                <span>
                  {editingBooking.service} •{" "}
                  {
                    editingBooking.duration
                  }
                </span>
              </div>
            </div>

            <div className="edit-booking-form">
              {/* THERAPIST */}

              <div className="edit-booking-field">
                <label>
                  Therapist
                </label>

                <select
                  value={editTherapist}
                  onChange={(e) =>
                    setEditTherapist(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Therapist
                  </option>

                  {editTherapistOptions.map(
                    (therapist) => (
                      <option
                        key={therapist.id}
                        value={
                          therapist.name
                        }
                      >
                        {therapist.name}
                        {therapist.status ===
                          "Available"
                          ? " - Available"
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* ROOM */}

              <div className="edit-booking-field">
                <label>Room</label>

                <select
                  value={editRoom}
                  onChange={(e) =>
                    setEditRoom(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Room
                  </option>

                  {editRoomOptions.map(
                    (room) => (
                      <option
                        key={room.id}
                        value={room.name}
                      >
                        {room.name}
                        {room.status ===
                          "Available"
                          ? " - Available"
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DATE/TIME ONLY FOR UPCOMING */}

              {!isActiveEdit && (
                <>
                  <div className="edit-booking-field">
                    <label>Date</label>

                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) =>
                        setEditDate(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="edit-booking-field">
                    <label>Time</label>

                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) =>
                        setEditTime(
                          e.target.value
                        )
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="edit-booking-footer">
              <button
                type="button"
                className="edit-cancel-btn"
                onClick={closeEdit}
                disabled={savingEdit}
              >
                Cancel
              </button>

              <button
                type="button"
                className="edit-save-btn"
                onClick={
                  handleSaveEdit
                }
                disabled={savingEdit}
              >
                {savingEdit
                  ? "Saving..."
                  : isActiveEdit
                    ? "Change Session"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;