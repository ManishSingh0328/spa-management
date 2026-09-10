import { NavLink, useNavigate } from "react-router-dom";
import "./spashell.css";

function SpaShell({ children }) {
  const navigate = useNavigate();

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    // Remember Me login
    localStorage.removeItem("spaToken");
    localStorage.removeItem("spaAdmin");

    // Normal session login
    sessionStorage.removeItem("spaToken");
    sessionStorage.removeItem("spaAdmin");

    // Send user back to login
    navigate("/", { replace: true });
  };

  return (
    <div className="spa-shell">
      <aside className="spa-sidebar">
        <div className="spa-brand">
          <div className="spa-logo">S</div>

          <div>
            <h2>Serene</h2>
            <p>Spa Management</p>
          </div>
        </div>

        <nav className="spa-menu">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `spa-menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="spa-menu-icon">⌂</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `spa-menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="spa-menu-icon">♙</span>
            Clients
          </NavLink>

          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              `spa-menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="spa-menu-icon">▣</span>
            Bookings
          </NavLink>

          <NavLink
            to="/therapists"
            className={({ isActive }) =>
              `spa-menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="spa-menu-icon">♧</span>
            Therapists
          </NavLink>

          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              `spa-menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="spa-menu-icon">▤</span>
            Rooms
          </NavLink>

          <NavLink
            to="/payments"
            className={({ isActive }) =>
              `spa-menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="spa-menu-icon">₹</span>
            Payments
          </NavLink>
        </nav>

        <div className="spa-sidebar-bottom">
          <button className="spa-menu-item">
            <span className="spa-menu-icon">⚙</span>
            Settings
          </button>

          <button
            className="spa-menu-item spa-logout"
            onClick={handleLogout}
          >
            <span className="spa-menu-icon">↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="spa-content">
        {children}
      </main>
    </div>
  );
}

export default SpaShell;