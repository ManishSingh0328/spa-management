import { useEffect, useState } from "react";
import { useSpa } from "../../context/SpaContext";
import "./newbooking.css";
import { apiFetch } from "../../utils/api";

function NewBooking({ isOpen, onClose }) {
  const {
    addBooking,
    therapists,
    rooms,
    bookings,
  } = useSpa();

  const [clientName, setClientName] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [service, setService] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [paymentMode, setPaymentMode] =
    useState("");

  const [therapist, setTherapist] =
    useState("");

  const [room, setRoom] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");
    const [createdBooking, setCreatedBooking] =
  useState(null);
  /* ================= RETURNING CLIENT ================= */

const handleMobileChange = (value) => {
  const cleanMobile = value.replace(/\D/g, "").slice(0, 10);

  setMobile(cleanMobile);

  if (cleanMobile.length !== 10) {
    return;
  }

  const existingCustomer = [...bookings]
    .reverse()
    .find((booking) => booking.mobile === cleanMobile);

  if (existingCustomer) {
    setClientName(existingCustomer.clientName || "");
    setGender(existingCustomer.gender || "");
  }
};

  /* ================= CURRENT AVAILABILITY ================= */

  const availableTherapists =
    therapists.filter(
      (item) =>
        item.status === "Available"
    );

  const availableRooms =
    rooms.filter(
      (item) =>
        item.status === "Available"
    );

  /* ================= AUTO DATE & TIME ================= */

  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();

    const year =
      now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    const hours = String(
      now.getHours()
    ).padStart(2, "0");

    const minutes = String(
      now.getMinutes()
    ).padStart(2, "0");

    setDate(
      `${year}-${month}-${day}`
    );

    setTime(
      `${hours}:${minutes}`
    );
  }, [isOpen]);

  /* ================= RESET ================= */

 const resetForm = () => {
  setClientName("");
  setMobile("");
  setGender("");
  setService("");
  setDuration("");
  setAmount("");
  setPaymentMode("");
  setTherapist("");
  setRoom("");
  setDate("");
  setTime("");
  setCreatedBooking(null);
};

  const handleClose = () => {
    resetForm();
    onClose();
  };

  /* ================= SERVICE ================= */

  const handleServiceChange = (
    selectedService
  ) => {
    setService(selectedService);

    if (
      selectedService ===
      "Swedish Massage"
    ) {
      setDuration("60");
      setAmount("1500");
    } else if (
      selectedService ===
      "Deep Tissue Massage"
    ) {
      setDuration("60");
      setAmount("1800");
    } else if (
      selectedService ===
      "Aromatherapy"
    ) {
      setDuration("90");
      setAmount("2200");
    } else if (
      selectedService ===
      "Thai Massage"
    ) {
      setDuration("60");
      setAmount("2000");
    } else if (
      selectedService ===
      "Head Massage"
    ) {
      setDuration("30");
      setAmount("800");
    } else {
      setDuration("");
      setAmount("");
    }
  };

  /* ================= TIME HELPERS ================= */

  const getMinutesFromTime = (
    timeValue
  ) => {
    if (!timeValue) return 0;

    const [
      hours,
      minutes,
    ] = timeValue.split(":");

    return (
      Number(hours) * 60 +
      Number(minutes)
    );
  };

  const getBookingDuration = (
    booking
  ) => {
    return (
      parseInt(
        booking.duration
      ) || 60
    );
  };

  const hasTimeConflict = (
    existingBooking
  ) => {
    if (
      existingBooking.date !== date
    ) {
      return false;
    }

    if (
      existingBooking.status ===
      "Completed"
    ) {
      return false;
    }

    const newStart =
      getMinutesFromTime(time);

    const newEnd =
      newStart +
      Number(duration);

    const existingStart =
      getMinutesFromTime(
        existingBooking.time
      );

    const existingEnd =
      existingStart +
      getBookingDuration(
        existingBooking
      );

    return (
      newStart <
        existingEnd &&
      newEnd >
        existingStart
    );
  };

  /* ================= BOOKING ================= */

const handleBooking = async () => {
  if (
    !clientName.trim() ||
    !mobile ||
    !gender ||
    !service ||
    !duration ||
    !amount ||
    !paymentMode ||
    !therapist ||
    !room ||
    !date ||
    !time
  ) {
    alert("Please fill all required fields.");
    return;
  }

  if (mobile.length !== 10) {
    alert("Please enter a valid 10 digit mobile number.");
    return;
  }

  const selectedTherapist = therapists.find(
    (item) => item.name === therapist
  );

  if (
    !selectedTherapist ||
    selectedTherapist.status !== "Available"
  ) {
    alert("Selected therapist is currently unavailable.");
    return;
  }

  const selectedRoom = rooms.find(
    (item) => item.name === room
  );

  if (
    !selectedRoom ||
    selectedRoom.status !== "Available"
  ) {
    alert("Selected room is currently occupied.");
    return;
  }

  const therapistConflict = bookings.find(
    (booking) =>
      booking.therapist === therapist &&
      hasTimeConflict(booking)
  );

  if (therapistConflict) {
   alert(
  `${therapist} already has a booking during this time. Please select another therapist or change the booking time.`
);
    return;
  }

  const roomConflict = bookings.find(
    (booking) =>
      booking.room === room &&
      hasTimeConflict(booking)
  );

  if (roomConflict) {
  alert(
  `${room} already has a booking during this time. Please select another room or change the booking time.`
);
    return;
  }

  const bookingData = {
    clientName: clientName.trim(),
    mobile,
    gender,
    service,
    duration: `${duration} min`,
    amount: Number(amount),
    paymentMode,
    therapist,
    room,
    date,
    time,
  };

  try {
const response = await apiFetch(
  "/api/bookings",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  }
);

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Booking failed.");
      return;
    }

    addBooking(result.data);

setCreatedBooking(result.data);

alert("Booking created successfully.");
  } catch (error) {
    console.error("Booking Error:", error);
    alert("Backend server connection failed.");
  }
};

/* ================= SEND WHATSAPP ================= */

const handleWhatsApp = () => {
  if (!createdBooking) {
    return;
  }

  const selectedTherapist = therapists.find(
    (item) =>
      item.name === createdBooking.therapist
  );

  if (!selectedTherapist?.mobile) {
    alert("Therapist mobile number not found.");
    return;
  }

  if (!createdBooking.sessionToken) {
    alert("Session link not available.");
    return;
  }

  const whatsappNumber =
    `91${selectedTherapist.mobile.replace(/\D/g, "")}`;

  const sessionLink =
    `${window.location.origin}/session/${createdBooking.sessionToken}`;

  const message = `New Therapy Session

Client: ${createdBooking.clientName}
Room: ${createdBooking.room}
Therapy: ${createdBooking.service}
Duration: ${createdBooking.duration}

Start / Complete Session:
${sessionLink}

Tap the link above to open your session.`;

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

 window.open(
  whatsappUrl,
  "spaWhatsApp"
);
};

if (!isOpen) {
  return null;
}
  return (
    <div
      className="new-booking-overlay"
      onClick={handleClose}
    >
      <div
        className="new-booking-drawer"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="new-booking-header">
          <div>
            <p>
              CREATE APPOINTMENT
            </p>

            <h2>
              New Booking
            </h2>

            <span>
              Add client and session details.
            </span>
          </div>

          <button
            className="new-booking-close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* CONTENT */}

        <div className="new-booking-content">
          {/* CLIENT */}

          <div className="booking-form-section">
            <div className="booking-section-heading">
              <span>01</span>

              <div>
                <h3>
                  Client Details
                </h3>

                <p>
                  Basic client information
                </p>
              </div>
            </div>

            <div className="booking-form-grid">
              <div className="booking-form-group full">
                <label>
                  CLIENT NAME *
                </label>

                <input
                  type="text"
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) =>
                    setClientName(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="booking-form-group">
                <label>
                  MOBILE NUMBER *
                </label>

                <input
  type="tel"
  maxLength="10"
  placeholder="10 digit mobile number"
  value={mobile}
  onChange={(e) =>
    handleMobileChange(e.target.value)
  }
/>
              </div>

              <div className="booking-form-group">
                <label>
                  GENDER *
                </label>

                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* SESSION */}

          <div className="booking-form-section">
            <div className="booking-section-heading">
              <span>02</span>

              <div>
                <h3>
                  Session & Payment
                </h3>

                <p>
                  Service, duration and payment
                </p>
              </div>
            </div>

            <div className="booking-form-grid">
              <div className="booking-form-group full">
                <label>
                  SERVICE *
                </label>

                <select
                  value={service}
                  onChange={(e) =>
                    handleServiceChange(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select service
                  </option>

                  <option value="Swedish Massage">
                    Swedish Massage
                  </option>

                  <option value="Deep Tissue Massage">
                    Deep Tissue Massage
                  </option>

                  <option value="Aromatherapy">
                    Aromatherapy
                  </option>

                  <option value="Thai Massage">
                    Thai Massage
                  </option>

                  <option value="Head Massage">
                    Head Massage
                  </option>
                </select>
              </div>

              <div className="booking-form-group">
                <label>
                  DURATION *
                </label>

                <select
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select duration
                  </option>

                  <option value="30">
                    30 Minutes
                  </option>

                  <option value="45">
                    45 Minutes
                  </option>

                  <option value="60">
                    60 Minutes
                  </option>

                  <option value="90">
                    90 Minutes
                  </option>

                  <option value="120">
                    120 Minutes
                  </option>
                </select>
              </div>

              <div className="booking-form-group">
                <label>
                  AMOUNT *
                </label>

                <div className="booking-amount-input">
                  <span>₹</span>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={amount}
                    onChange={(e) =>
                      setAmount(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="booking-form-group full">
                <label>
                  PAYMENT MODE *
                </label>

                <select
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select payment mode
                  </option>

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Card">
                    Card
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* ASSIGNMENT */}

          <div className="booking-form-section">
            <div className="booking-section-heading">
              <span>03</span>

              <div>
                <h3>
                  Therapist & Room
                </h3>

                <p>
                  Assign available resources
                </p>
              </div>
            </div>

            <div className="booking-form-grid">
              <div className="booking-form-group">
                <label>
                  THERAPIST *
                </label>

                <select
                  value={therapist}
                  onChange={(e) =>
                    setTherapist(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select available therapist
                  </option>

                  {availableTherapists.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="booking-form-group">
                <label>
                  ROOM *
                </label>

                <select
                  value={room}
                  onChange={(e) =>
                    setRoom(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select available room
                  </option>

                  {availableRooms.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* SCHEDULE */}

          <div className="booking-form-section">
            <div className="booking-section-heading">
              <span>04</span>

              <div>
                <h3>
                  Schedule
                </h3>

                <p>
                  Date and time
                </p>
              </div>
            </div>

            <div className="booking-form-grid">
              <div className="booking-form-group">
                <label>
                  DATE *
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="booking-form-group">
                <label>
                  TIME *
                </label>

                <input
                  type="time"
                  value={time}
                  onChange={(e) =>
                    setTime(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}

     <div className="new-booking-footer">
  {!createdBooking ? (
    <>
      <button
        className="booking-cancel-btn"
        onClick={handleClose}
      >
        Cancel
      </button>

      <button
        className="booking-confirm-btn"
        onClick={handleBooking}
      >
        Confirm Booking
      </button>
    </>
  ) : (
    <>
      <button
        className="booking-cancel-btn"
        onClick={handleClose}
      >
        Close
      </button>

      <button
        className="booking-confirm-btn"
        onClick={handleWhatsApp}
      >
        WhatsApp Therapist
      </button>
    </>
  )}
</div>
      </div>
    </div>
  );
}

export default NewBooking;