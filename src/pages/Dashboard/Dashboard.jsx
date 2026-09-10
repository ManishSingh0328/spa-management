import { useEffect, useState } from "react";
import { useSpa } from "../../context/SpaContext";
import NewBooking from "../../components/NewBooking/newbooking";
import "./dashboard.css";

function Dashboard() {
  const { bookings, therapists } = useSpa();

  const [showBookingForm, setShowBookingForm] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  /* ================= LIVE CLOCK ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================= DATE ================= */

  const getLocalDateString = (date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayDate =
    getLocalDateString(currentTime);

  /* ================= TODAY BOOKINGS ================= */

  const todaysBookings = bookings.filter(
    (booking) =>
      booking.date === todayDate
  );

  const todaysClients =
    todaysBookings.length;

  const todaysSales =
    todaysBookings.reduce(
      (total, booking) =>
        total +
        Number(booking.amount || 0),
      0
    );

  /* ================= ACTIVE SESSIONS ================= */

  const activeBookings =
    bookings.filter(
      (booking) =>
        booking.status === "In Service"
    );

  /* ================= BUSY THERAPISTS ================= */

  const busyTherapists =
    activeBookings.map((booking) => {
      const therapistData =
        therapists.find(
          (item) =>
            item.name ===
            booking.therapist
        );

      return {
        id:
          therapistData?.id ||
          booking.id,

        name:
          booking.therapist,

        mobile:
          therapistData?.mobile ||
          "",

        todayTherapy:
          therapistData?.todayTherapy ||
          0,

        activeBooking:
          booking,
      };
    });

  /* ================= BUSY NAMES ================= */

  const busyTherapistNames =
    activeBookings.map(
      (booking) =>
        booking.therapist
    );

  /* ================= AVAILABLE ================= */

  const availableTherapists =
    therapists.filter(
      (therapist) =>
        !busyTherapistNames.includes(
          therapist.name
        )
    );

  /* ================= REMAINING TIMER ================= */

  const getRemainingTime = (
    booking
  ) => {
    if (
      !booking ||
      !booking.endAt
    ) {
      return "--:--";
    }

    const difference =
      booking.endAt -
      currentTime.getTime();

    if (difference <= 0) {
      return "00:00";
    }

    const totalSeconds =
      Math.floor(
        difference / 1000
      );

    const hours =
      Math.floor(
        totalSeconds / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) /
          60
      );

    const seconds =
      totalSeconds % 60;

    if (hours > 0) {
      return `${String(
        hours
      ).padStart(
        2,
        "0"
      )}:${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        seconds
      ).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      seconds
    ).padStart(
      2,
      "0"
    )}`;
  };

  /* ================= FORMAT BOOKING TIME ================= */

  const formatBookingTime = (
    time
  ) => {
    if (!time) return "-";

    const [hours, minutes] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours)
    );

    date.setMinutes(
      Number(minutes)
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  /* ================= HEADER DATE ================= */

  const formattedDate =
    currentTime.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  const formattedTime =
    currentTime.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
    );

  /* ================= GREETING ================= */

  const hour =
    currentTime.getHours();

  let greeting =
    "Good Evening";

  if (hour < 12) {
    greeting =
      "Good Morning";
  } else if (hour < 17) {
    greeting =
      "Good Afternoon";
  }

  return (
    <div className="dashboard-page">

      {/* ================= HEADER ================= */}

      <header className="dashboard-header">
        <div>
          <p className="header-welcome">
            Welcome back
          </p>

          <h1>
            {greeting}, Admin
          </h1>
        </div>

        <div className="header-right">
          <div className="date-time">
            <span className="current-date">
              {formattedDate}
            </span>

            <strong>
              {formattedTime}
            </strong>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>
                Admin
              </strong>

              <span>
                Reception
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= TITLE ================= */}

      <section className="dashboard-title-row">
        <div>
          <h2>
            Dashboard
          </h2>

          <p>
            Live overview of today's
            spa operations.
          </p>
        </div>

        <button
          type="button"
          className="new-booking-button"
          onClick={() =>
            setShowBookingForm(true)
          }
        >
          <span>＋</span>
          New Booking
        </button>
      </section>

      {/* ================= STATS ================= */}

      <section className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div className="stat-top">
            <span>
              TODAY'S CLIENTS
            </span>

            <div className="stat-icon">
              ♙
            </div>
          </div>

          <h3>
            {todaysClients}
          </h3>

          <p>
            Clients booked today
          </p>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-top">
            <span>
              TODAY'S TOTAL SALES
            </span>

            <div className="stat-icon">
              ₹
            </div>
          </div>

          <h3>
            ₹
            {todaysSales.toLocaleString(
              "en-IN"
            )}
          </h3>

          <p>
            Booking value today
          </p>
        </div>
      </section>

      {/* ================= THERAPISTS ================= */}

      <section className="therapist-grid">

        {/* AVAILABLE */}

        <div className="therapist-panel">
          <div className="panel-heading">
            <div>
              <h3>
                Available Therapists
              </h3>

              <p>
                Ready for new sessions
              </p>
            </div>

            <span className="available-count">
              {availableTherapists.length} Available
            </span>
          </div>

          <div className="therapist-list">
            {availableTherapists.map(
              (therapist) => (
                <div
                  className="therapist-row"
                  key={therapist.id}
                >
                  <div className="therapist-info">
                    <div className="therapist-avatar">
                      {therapist.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {therapist.name}
                      </strong>

                      <span className="available-status">
                        <i></i>
                        Available
                      </span>
                    </div>
                  </div>

                  <div className="dashboard-therapy-count">
                    <strong>
                      {therapist.todayTherapy ||
                        0}
                    </strong>

                    <span>
                      Today
                    </span>
                  </div>
                </div>
              )
            )}

            {availableTherapists.length ===
              0 && (
              <div className="dashboard-empty-state">
                No therapist currently available.
              </div>
            )}
          </div>
        </div>

        {/* BUSY */}

        <div className="therapist-panel busy-panel">
          <div className="panel-heading">
            <div>
              <h3>
                Busy Therapists
              </h3>

              <p>
                Currently in session
              </p>
            </div>

            <span className="busy-count">
              {busyTherapists.length} Busy
            </span>
          </div>

          <div className="therapist-list">
            {busyTherapists.map(
              (therapist) => (
                <div
                  className="therapist-row busy-therapist-row"
                  key={
                    therapist.activeBooking.id
                  }
                >
                  <div className="therapist-info">
                    <div className="therapist-avatar busy-avatar">
                      {therapist.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {therapist.name}
                      </strong>

                      <span className="busy-room">
                        {
                          therapist.activeBooking
                            .room
                        }
                      </span>
                    </div>
                  </div>

                  <div className="dashboard-live-session">
                    <span className="dashboard-live-label">
                      <i></i>
                      IN SERVICE
                    </span>

                    <strong>
                      {getRemainingTime(
                        therapist.activeBooking
                      )}
                    </strong>

                    <small>
                      remaining
                    </small>
                  </div>
                </div>
              )
            )}

            {busyTherapists.length ===
              0 && (
              <div className="dashboard-empty-state">
                No active sessions.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= TODAY APPOINTMENTS ================= */}

      <section className="appointments-panel">
        <div className="appointments-heading">
          <div>
            <h3>
              Today's Appointments
            </h3>

            <p>
              Live overview of today's
              scheduled sessions
            </p>
          </div>
        </div>

        <div className="appointment-table-wrapper">
          <table className="appointment-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>CLIENT</th>
                <th>SERVICE</th>
                <th>THERAPIST</th>
                <th>ROOM</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {todaysBookings.map(
                (booking) => (
                  <tr key={booking.id}>
                    <td className="appointment-time">
                      {formatBookingTime(
                        booking.time
                      )}
                    </td>

                    <td>
                      <strong>
                        {booking.clientName}
                      </strong>
                    </td>

                    <td>
                      {booking.service}
                    </td>

                    <td>
                      {booking.therapist}
                    </td>

                    <td>
                      <span className="room-badge">
                        {booking.room}
                      </span>
                    </td>

                    <td>
                      {booking.status ===
                      "In Service" ? (
                        <div className="dashboard-table-live">
                          <span className="status-badge in-service">
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
                          className={
                            booking.status ===
                            "Completed"
                              ? "status-badge completed"
                              : "status-badge upcoming"
                          }
                        >
                          {booking.status}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              )}

              {todaysBookings.length ===
                0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="dashboard-no-appointments"
                  >
                    No appointments today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= NEW BOOKING ================= */}

      <NewBooking
        isOpen={showBookingForm}
        onClose={() =>
          setShowBookingForm(false)
        }
      />
    </div>
  );
}

export default Dashboard;