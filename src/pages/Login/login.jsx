import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to sign in. Please try again."
        );
        return;
      }

      if (rememberMe) {
        localStorage.setItem("spaToken", data.token);
        localStorage.setItem(
          "spaAdmin",
          JSON.stringify(data.admin)
        );

        sessionStorage.removeItem("spaToken");
        sessionStorage.removeItem("spaAdmin");
      } else {
        sessionStorage.setItem("spaToken", data.token);
        sessionStorage.setItem(
          "spaAdmin",
          JSON.stringify(data.admin)
        );

        localStorage.removeItem("spaToken");
        localStorage.removeItem("spaAdmin");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);

      setError(
        "Cannot connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-visual">
        <div className="visual-overlay"></div>

        <div className="visual-top">
          <div className="brand">
            <div className="brand-mark">
              <span>S</span>
            </div>

            <div>
              <h2>Serene</h2>
              <p>Spa Management</p>
            </div>
          </div>
        </div>

        <div className="visual-content">
          <span className="visual-label">
            SPA OPERATIONS, SIMPLIFIED
          </span>

          <h1>
            Run your spa
            <br />
            with confidence.
          </h1>

          <p>
            Manage clients, bookings, therapists and payments from one
            beautifully organized workspace.
          </p>

          <div className="feature-row">
            <div className="feature-item">
              <span>01</span>

              <div>
                <h4>Smart Bookings</h4>
                <p>Simple appointment management</p>
              </div>
            </div>

            <div className="feature-item">
              <span>02</span>

              <div>
                <h4>Client Records</h4>
                <p>Everything in one place</p>
              </div>
            </div>

            <div className="feature-item">
              <span>03</span>

              <div>
                <h4>Easy Payments</h4>
                <p>Track daily sales clearly</p>
              </div>
            </div>
          </div>
        </div>

        <div className="visual-footer">
          Professional Spa Management Software
        </div>
      </section>

      <section className="login-form-area">
        <div className="mobile-brand">
          <div className="brand-mark small">
            <span>S</span>
          </div>

          <div>
            <h2>Serene</h2>
            <p>Spa Management</p>
          </div>
        </div>

        <div className="login-wrapper">
          <div className="login-header">
            <span className="welcome-tag">
              WELCOME BACK
            </span>

            <h2>Sign in to your workspace</h2>

            <p>
              Enter your account details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Email or Username</label>

              <div className="input-wrapper">
                <span className="input-icon">
                  ✉
                </span>

                <input
                  type="text"
                  placeholder="admin@serenespa.com"
                  value={email}
                  autoComplete="username"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              </div>
            </div>

            <div className="form-field">
              <div className="password-label-row">
                <label>Password</label>

                <button
                  type="button"
                  className="forgot-link"
                >
                  Forgot password?
                </button>
              </div>

              <div className="input-wrapper">
                <span className="input-icon">
                  ●
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "14px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#f8ece9",
                  color: "#8a3d2f",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {error}
              </div>
            )}

            <div className="form-bottom">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="signin-btn"
              disabled={loading}
            >
              <span>
                {loading ? "Signing In..." : "Sign In"}
              </span>

              {!loading && (
                <span className="btn-arrow">
                  →
                </span>
              )}
            </button>
          </form>

          <div className="login-security">
            <span className="security-dot"></span>
            Secure access to your spa workspace
          </div>
        </div>

        <div className="form-footer">
          © 2026 Serene Spa Management
        </div>
      </section>
    </div>
  );
}

export default Login;