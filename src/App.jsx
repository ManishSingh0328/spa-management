import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login/login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Clients from "./pages/Clients/Clients";
import Bookings from "./pages/Bookings/Bookings";
import Therapists from "./pages/Therapists/Therapists";
import Payments from "./pages/Payments/Payments";
import Rooms from "./pages/Rooms/Rooms";

import SpaShell from "./components/spashell";
import ProtectedRoute from "./components/ProtectedRoute";
import { SpaProvider } from "./context/SpaContext";

import "./App.css";

/* ================= PROTECTED LAYOUT ================= */

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <SpaProvider>
        <SpaShell>{children}</SpaShell>
      </SpaProvider>
    </ProtectedRoute>
  );
}

/* ================= APP ================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}

        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedPage>
              <Dashboard />
            </ProtectedPage>
          }
        />

        {/* CLIENTS */}

        <Route
          path="/clients"
          element={
            <ProtectedPage>
              <Clients />
            </ProtectedPage>
          }
        />

        {/* BOOKINGS */}

        <Route
          path="/bookings"
          element={
            <ProtectedPage>
              <Bookings />
            </ProtectedPage>
          }
        />

        {/* THERAPISTS */}

        <Route
          path="/therapists"
          element={
            <ProtectedPage>
              <Therapists />
            </ProtectedPage>
          }
        />

        {/* ROOMS */}

        <Route
          path="/rooms"
          element={
            <ProtectedPage>
              <Rooms />
            </ProtectedPage>
          }
        />

        {/* PAYMENTS */}

        <Route
          path="/payments"
          element={
            <ProtectedPage>
              <Payments />
            </ProtectedPage>
          }
        />

        {/* UNKNOWN ROUTE */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;