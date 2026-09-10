import { useMemo, useState } from "react";
import { useSpa } from "../../context/SpaContext";
import "./payments.css";

function Payments() {
  const { bookings } = useSpa();

  const [dateFilter, setDateFilter] = useState("Today");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = new Date();

  /* ================= FILTER PAYMENTS ================= */

  const filteredPayments = useMemo(() => {
    return bookings.filter((booking) => {
      // Payments me sirf completed bookings
      if (booking.status !== "Completed") {
        return false;
      }

      const bookingDate = new Date(
        `${booking.date}T00:00:00`
      );

      let dateMatch = true;

      /* ===== TODAY ===== */

      if (dateFilter === "Today") {
        dateMatch =
          booking.date === getLocalDateString(today);
      }

      /* ===== YESTERDAY ===== */

      if (dateFilter === "Yesterday") {
        const yesterday = new Date(today);

        yesterday.setDate(
          today.getDate() - 1
        );

        dateMatch =
          booking.date ===
          getLocalDateString(yesterday);
      }

      /* ===== THIS WEEK ===== */

      if (dateFilter === "This Week") {
        const startOfWeek = new Date(today);

        const currentDay =
          today.getDay();

        startOfWeek.setDate(
          today.getDate() - currentDay
        );

        startOfWeek.setHours(
          0,
          0,
          0,
          0
        );

        const endOfWeek =
          new Date(startOfWeek);

        endOfWeek.setDate(
          startOfWeek.getDate() + 6
        );

        endOfWeek.setHours(
          23,
          59,
          59,
          999
        );

        dateMatch =
          bookingDate >= startOfWeek &&
          bookingDate <= endOfWeek;
      }

      /* ===== THIS MONTH ===== */

      if (dateFilter === "This Month") {
        dateMatch =
          bookingDate.getMonth() ===
            today.getMonth() &&
          bookingDate.getFullYear() ===
            today.getFullYear();
      }

      /* ===== THIS YEAR ===== */

      if (dateFilter === "This Year") {
        dateMatch =
          bookingDate.getFullYear() ===
          today.getFullYear();
      }

      /* ===== ALL ===== */

      if (dateFilter === "All") {
        dateMatch = true;
      }

      /* ===== PAYMENT MODE ===== */

      let paymentMatch = true;

      if (paymentFilter !== "All") {
        paymentMatch =
          booking.paymentMode ===
          paymentFilter;
      }

      return dateMatch && paymentMatch;
    });
  }, [
    bookings,
    dateFilter,
    paymentFilter,
  ]);

  /* ================= TOTAL COLLECTION ================= */

  const totalAmount =
    filteredPayments.reduce(
      (total, booking) =>
        total +
        Number(
          booking.amount || 0
        ),
      0
    );

  /* ================= CASH ================= */

  const totalCash = filteredPayments
    .filter(
      (booking) =>
        booking.paymentMode === "Cash"
    )
    .reduce(
      (total, booking) =>
        total +
        Number(
          booking.amount || 0
        ),
      0
    );

  /* ================= UPI ================= */

  const totalUpi = filteredPayments
    .filter(
      (booking) =>
        booking.paymentMode === "UPI"
    )
    .reduce(
      (total, booking) =>
        total +
        Number(
          booking.amount || 0
        ),
      0
    );

  /* ================= CARD ================= */

  const totalCard = filteredPayments
    .filter(
      (booking) =>
        booking.paymentMode === "Card"
    )
    .reduce(
      (total, booking) =>
        total +
        Number(
          booking.amount || 0
        ),
      0
    );

  /* ================= INVOICE NUMBER ================= */

  const getInvoiceNumber = (booking) => {
    return `INV-${String(
      booking.id
    ).slice(-6)}`;
  };

  return (
    <div className="payments-page">
      {/* ================= HEADER ================= */}

      <div className="payments-header">
        <div>
          <p className="payments-label">
            PAYMENT MANAGEMENT
          </p>

          <h1>Payments</h1>

          <p className="payments-subtitle">
            View completed spa payment records
            and invoices.
          </p>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="payments-filters">
        <div className="payment-filter-group">
          <label>Date Filter</label>

          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value
              )
            }
          >
            <option value="Today">
              Today
            </option>

            <option value="Yesterday">
              Yesterday
            </option>

            <option value="This Week">
              This Week
            </option>

            <option value="This Month">
              This Month
            </option>

            <option value="This Year">
              This Year
            </option>

            <option value="All">
              All
            </option>
          </select>
        </div>

        <div className="payment-filter-group">
          <label>Payment Mode</label>

          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All
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

      {/* ================= SUMMARY ================= */}

      <div className="payment-summary-grid">
        <div className="payment-summary-card">
          <p>
            Total Collection
          </p>

          <h2>
            ₹
            {totalAmount.toLocaleString(
              "en-IN"
            )}
          </h2>

          <span>
            {filteredPayments.length} payment
            records
          </span>
        </div>

        <div className="payment-summary-card">
          <p>Cash</p>

          <h2>
            ₹
            {totalCash.toLocaleString(
              "en-IN"
            )}
          </h2>

          <span>
            Cash collection
          </span>
        </div>

        <div className="payment-summary-card">
          <p>UPI</p>

          <h2>
            ₹
            {totalUpi.toLocaleString(
              "en-IN"
            )}
          </h2>

          <span>
            Digital payments
          </span>
        </div>

        <div className="payment-summary-card">
          <p>Card</p>

          <h2>
            ₹
            {totalCard.toLocaleString(
              "en-IN"
            )}
          </h2>

          <span>
            Card collection
          </span>
        </div>
      </div>

      {/* ================= PAYMENT TABLE ================= */}

      <div className="payments-card">
        <div className="payments-card-header">
          <div>
            <h3>
              Payment Records
            </h3>

            <p>
              Completed booking and
              payment history
            </p>
          </div>

          <span className="payment-record-count">
            {filteredPayments.length} Records
          </span>
        </div>

        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>
                  INVOICE NO.
                </th>

                <th>
                  CLIENT NAME
                </th>

                <th>
                  MOBILE
                </th>

                <th>
                  SERVICE
                </th>

                <th>
                  DURATION
                </th>

                <th>
                  AMOUNT
                </th>

                <th>
                  PAYMENT MODE
                </th>

                <th>
                  DATE
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map(
                (booking) => (
                  <tr
                    key={booking.id}
                  >
                    <td>
                      <button
                        className="invoice-number"
                        onClick={() =>
                          setSelectedInvoice(
                            booking
                          )
                        }
                      >
                        {getInvoiceNumber(
                          booking
                        )}
                      </button>
                    </td>

                    <td>
                      <strong>
                        {
                          booking.clientName
                        }
                      </strong>
                    </td>

                    <td>
                      {
                        booking.mobile
                      }
                    </td>

                    <td>
                      {
                        booking.service
                      }
                    </td>

                    <td>
                      {
                        booking.duration
                      }
                    </td>

                    <td className="payment-amount">
                      ₹
                      {Number(
                        booking.amount ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      <span className="payment-mode-badge">
                        {booking.paymentMode ||
                          "Not Added"}
                      </span>
                    </td>

                    <td>
                      {
                        booking.date
                      }
                    </td>
                  </tr>
                )
              )}

              {filteredPayments.length ===
                0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="no-payments"
                  >
                    No payment records
                    found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= INVOICE ================= */}

      {selectedInvoice && (
        <div
          className="invoice-overlay"
          onClick={() =>
            setSelectedInvoice(
              null
            )
          }
        >
          <div
            className="invoice-box"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* INVOICE HEADER */}

            <div className="invoice-header">
              <div className="invoice-brand">
                <div className="invoice-logo">
                  S
                </div>

                <div>
                  <h2>
                    Serene Spa
                  </h2>

                  <p>
                    Wellness & Therapy Centre
                  </p>
                </div>
              </div>

              <div className="invoice-title-area">
                <button
                  className="invoice-close"
                  onClick={() =>
                    setSelectedInvoice(
                      null
                    )
                  }
                >
                  ×
                </button>

                <h1>
                  INVOICE
                </h1>

                <span>
                  {getInvoiceNumber(
                    selectedInvoice
                  )}
                </span>
              </div>
            </div>

            <div className="invoice-divider"></div>

            {/* CLIENT INFO */}

            <div className="invoice-info-grid">
              <div className="invoice-customer">
                <p className="invoice-small-title">
                  BILLED TO
                </p>

                <h3>
                  {
                    selectedInvoice.clientName
                  }
                </h3>

                <p>
                  +91{" "}
                  {
                    selectedInvoice.mobile
                  }
                </p>
              </div>

              <div className="invoice-details">
                <div>
                  <span>
                    Invoice Date
                  </span>

                  <strong>
                    {
                      selectedInvoice.date
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Booking Time
                  </span>

                  <strong>
                    {selectedInvoice.time ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Mode
                  </span>

                  <strong>
                    {selectedInvoice.paymentMode ||
                      "Not Added"}
                  </strong>
                </div>
              </div>
            </div>

            {/* SERVICE */}

            <div className="invoice-service">
              <div className="invoice-service-header">
                <span>
                  DESCRIPTION
                </span>

                <span>
                  DURATION
                </span>

                <span>
                  AMOUNT
                </span>
              </div>

              <div className="invoice-service-row">
                <div>
                  <strong>
                    {
                      selectedInvoice.service
                    }
                  </strong>

                  <p>
                    Professional spa wellness
                    service
                  </p>
                </div>

                <span>
                  {
                    selectedInvoice.duration
                  }
                </span>

                <strong>
                  ₹
                  {Number(
                    selectedInvoice.amount ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            </div>

            {/* TOTAL */}

            <div className="invoice-summary">
              <div className="invoice-message">
                <span>
                  PAYMENT RECEIVED
                </span>

                <h4>
                  Thank you for your visit
                </h4>

                <p>
                  We hope you enjoyed your
                  experience at Serene Spa.
                </p>
              </div>

              <div className="invoice-total-area">
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹
                    {Number(
                      selectedInvoice.amount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div className="invoice-total-line">
                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      selectedInvoice.amount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="invoice-footer">
              <div>
                <strong>
                  Serene Spa
                </strong>

                <p>
                  Relax • Refresh • Rejuvenate
                </p>
              </div>

              <button
                className="invoice-print-btn"
                onClick={() =>
                  window.print()
                }
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;