import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./session.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function Session() {
  const { token } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState("");

  const [remainingSeconds, setRemainingSeconds] =
    useState(0);

  /* ================= LOAD SESSION ================= */

  const loadSession = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/public/${token}`
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message || "Session not found."
        );
        setBooking(null);
        return;
      }

      setBooking(result.data);
    } catch (error) {
      console.error(
        "Load Session Error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [token]);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (
      booking?.status !== "In Service" ||
      !booking?.endAt
    ) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const endTime = new Date(
        booking.endAt
      ).getTime();

      const now = Date.now();

      const difference = Math.max(
        0,
        Math.floor(
          (endTime - now) / 1000
        )
      );

      setRemainingSeconds(difference);
    };

    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000
    );

    return () => clearInterval(interval);
  }, [booking?.status, booking?.endAt]);

  /* ================= FORMAT TIMER ================= */

  const formatTimer = (seconds) => {
    const minutes = Math.floor(
      seconds / 60
    );

    const secs = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  /* ================= START ================= */

  const handleStart = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/public/${token}/start`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Unable to start session."
        );
        return;
      }

      await loadSession();
    } catch (error) {
      console.error(
        "Start Session Error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= COMPLETE ================= */

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/public/${token}/complete`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Unable to complete session."
        );
        return;
      }

      await loadSession();
    } catch (error) {
      console.error(
        "Complete Session Error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="session-page">
        <div className="session-message">
          Loading session...
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="session-page">
        <div className="session-message error">
          {error}
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="session-page">
        <div className="session-message">
          Session not found.
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="session-page">
      <div className="session-header">
        <div className="session-logo">
          ♧
        </div>

        <h1>Therapy Session</h1>

        <p>
          WELLNESS • RELAX • REJUVENATE
        </p>
      </div>

      <div className="session-card">
        <div className="session-details">
          <div className="session-detail-row">
            <div className="session-icon">
              👤
            </div>

            <span className="session-label">
              Client:
            </span>

            <strong>
              {booking.clientName}
            </strong>
          </div>

          <div className="session-detail-row">
            <div className="session-icon">
              🍃
            </div>

            <span className="session-label">
              Therapy:
            </span>

            <strong>
              {booking.service}
            </strong>
          </div>

          <div className="session-detail-row">
            <div className="session-icon">
              🛏
            </div>

            <span className="session-label">
              Room:
            </span>

            <strong>
              {booking.room}
            </strong>
          </div>

          <div className="session-detail-row">
            <div className="session-icon">
              ◷
            </div>

            <span className="session-label">
              Session Time:
            </span>

            <strong>
              {booking.duration} Minutes
            </strong>
          </div>
        </div>

        <div className="session-divider" />

        {/* STATUS */}

        <div
          className={`session-status ${
            booking.status === "In Service"
              ? "active"
              : booking.status === "Completed"
              ? "completed"
              : ""
          }`}
        >
          <span />

          {booking.status === "Upcoming"
            ? "Not Started"
            : booking.status === "In Service"
            ? "In Service"
            : "Completed"}
        </div>

        {/* TIMER */}

        <div className="session-timer">
          {booking.status === "Upcoming" &&
            "00:00"}

          {booking.status === "In Service" &&
            formatTimer(remainingSeconds)}

          {booking.status === "Completed" &&
            "00:00"}
        </div>

        {/* MESSAGE */}

        {booking.status === "Upcoming" && (
          <p className="session-timer-message">
            Timer will start when you begin
            the session
          </p>
        )}

        {booking.status === "In Service" && (
          <p className="session-timer-message">
            Session is currently in progress
          </p>
        )}

        {booking.status === "Completed" && (
          <p className="session-timer-message">
            Session completed successfully
          </p>
        )}

        {error && (
          <div className="session-error">
            {error}
          </div>
        )}

        {/* BUTTON */}

        {booking.status === "Upcoming" && (
          <button
            type="button"
            className="session-action-btn"
            onClick={handleStart}
            disabled={actionLoading}
          >
            {actionLoading
              ? "Starting..."
              : "▶ Start Session"}
          </button>
        )}

        {booking.status === "In Service" && (
          <button
            type="button"
            className="session-action-btn complete"
            onClick={handleComplete}
            disabled={actionLoading}
          >
            {actionLoading
              ? "Completing..."
              : "✓ Complete Session"}
          </button>
        )}

        {booking.status === "Completed" && (
          <div className="session-completed">
            ✓ Session Completed
          </div>
        )}

        <div className="session-footer-note">
          🍃 Take care of yourself. You
          deserve it.
        </div>
      </div>
    </div>
  );
}

export default Session;