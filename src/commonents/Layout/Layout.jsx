import { NavLink, useNavigate } from "react-router-dom";
import "./layout.css";

export default function Layout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">S</div>

          <div>
            <h2>Serene</h2>
            <p>Spa Management</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">⌂</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">♙</span>
            Clients
          </NavLink>

          <button className="sidebar-item" type="button">
            <span className="sidebar-icon">▣</span>
            Bookings
          </button>

          <button className="sidebar-item" type="button">
            <span className="sidebar-icon">♧</span>
            Therapists
          </button>

          <button className="sidebar-item" type="button">
            <span className="sidebar-icon">₹</span>
            Payments
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-item" type="button">
            <span className="sidebar-icon">⚙</span>
            Settings
          </button>

          <button
            className="sidebar-item logout"
            type="button"
            onClick={() => navigate("/")}
          >
            <span className="sidebar-icon">↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="app-content">{children}</main>
    </div>
  );n
}