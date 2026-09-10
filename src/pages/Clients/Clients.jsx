import { useMemo, useState } from "react";
import { useSpa } from "../../context/SpaContext";
import "./Clients.css";

function Clients() {
  const { bookings } = useSpa();

  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  const clients = useMemo(() => {
    const clientMap = {};

    bookings.forEach((booking) => {
      const mobile = booking.mobile;

      if (!clientMap[mobile]) {
        clientMap[mobile] = {
          id: mobile,
          name: booking.clientName,
          mobile: booking.mobile,
          gender: booking.gender,
          totalVisits: 0,
          lastVisit:
  booking.status === "Completed"
    ? booking.date
    : null,
          visits: [],
        };
      }

      if (booking.status === "Completed") {
  clientMap[mobile].totalVisits += 1;
}

      clientMap[mobile].visits.push({
        id: booking.id,
        date: booking.date,
        time: booking.time,
        service: booking.service,
        therapist: booking.therapist,
        room: booking.room,
        duration: booking.duration,
        amount: booking.amount,
        status: booking.status,
      });
    if (booking.status === "Completed") {
      if (
    !clientMap[mobile].lastVisit ||
    new Date(booking.date) >
      new Date(clientMap[mobile].lastVisit)
  ) {
    clientMap[mobile].lastVisit = booking.date;
  }
}
    });

    return Object.values(clientMap);
  }, [bookings]);

  const filteredClients = clients.filter((client) => {
    const value = search.toLowerCase().trim();

    return (
      client.name.toLowerCase().includes(value) ||
      client.mobile.includes(value)
    );
  });

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="clients-page">
      {/* HEADER */}
      <div className="clients-header">
        <div>
          <p className="clients-label">CLIENT MANAGEMENT</p>

          <h1>Clients</h1>

          <p className="clients-subtitle">
            View client profiles and visit history.
          </p>
        </div>

        <div className="clients-total-box">
          <span>Total Clients</span>
          <strong>{clients.length}</strong>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="clients-card">
        <div className="clients-toolbar">
          <div className="clients-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search client name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="clients-table-wrapper">
          <table className="clients-table">
            <thead>
              <tr>
                <th>CLIENT NAME</th>
                <th>MOBILE NUMBER</th>
                <th>TOTAL VISITS</th>
                <th>LAST VISIT</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="client-profile">
                      <div className="client-avatar">
                        {client.name.charAt(0)}
                      </div>

                      <div>
                        <strong>{client.name}</strong>

                        <span>
                          {client.gender || "Client"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="client-mobile">
                    {client.mobile}
                  </td>

                  <td>
                    <span className="visits-badge">
                      {client.totalVisits}
                    </span>
                  </td>

                  <td>
                    {formatDate(client.lastVisit)}
                  </td>

                  <td>
                    <button
                      className="client-view-btn"
                      onClick={() =>
                        setSelectedClient(client)
                      }
                    >
                      View <span>→</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="no-clients"
                  >
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLIENT DETAIL DRAWER */}
      {selectedClient && (
        <div
          className="client-detail-overlay"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="client-detail-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="client-detail-header">
              <div>
                <p>CLIENT PROFILE</p>
                <h2>{selectedClient.name}</h2>
                <span>{selectedClient.mobile}</span>
              </div>

              <button
                className="client-detail-close"
                onClick={() =>
                  setSelectedClient(null)
                }
              >
                ×
              </button>
            </div>

            <div className="client-summary-grid">
              <div>
                <span>Total Visits</span>
                <strong>
                  {selectedClient.totalVisits}
                </strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>
                  {selectedClient.gender || "-"}
                </strong>
              </div>

              <div>
                <span>Last Visit</span>
                <strong>
                  {formatDate(
                    selectedClient.lastVisit
                  )}
                </strong>
              </div>
            </div>

            <div className="client-history">
              <div className="client-history-heading">
                <h3>Visit History</h3>
                <p>
                  Previous spa sessions and services.
                </p>
              </div>

              {selectedClient.visits
                .slice()
                .reverse()
                .map((visit) => (
                  <div
                    className="client-history-item"
                    key={visit.id}
                  >
                    <div className="history-top">
                      <div>
                        <strong>
                          {formatDate(visit.date)}
                        </strong>

                        <span>
                          {visit.time || "-"}
                        </span>
                      </div>

                      <span
                        className={`history-status ${
                          visit.status ===
                          "Completed"
                            ? "history-completed"
                            : visit.status ===
                              "In Service"
                            ? "history-service"
                            : "history-upcoming"
                        }`}
                      >
                        {visit.status}
                      </span>
                    </div>

                    <div className="history-details">
                      <div>
                        <span>Service</span>
                        <strong>
                          {visit.service}
                        </strong>
                      </div>

                      <div>
                        <span>Duration</span>
                        <strong>
                          {visit.duration}
                        </strong>
                      </div>

                      <div>
                        <span>Therapist</span>
                        <strong>
                          {visit.therapist}
                        </strong>
                      </div>

                      <div>
                        <span>Room</span>
                        <strong>
                          {visit.room}
                        </strong>
                      </div>

                      <div>
                        <span>Amount</span>
                        <strong>
                          ₹
                          {Number(
                            visit.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;