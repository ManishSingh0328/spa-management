import { useMemo, useState } from "react";
import { useSpa } from "../../context/SpaContext";
import "./therapists.css";

function Therapists() {
  const {
    therapists,
    addTherapist,
    updateTherapist,
    deleteTherapist,
  } = useSpa();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
const [mobile, setMobile] = useState("");
const [password, setPassword] = useState("");
const [status, setStatus] = useState("Available");

  const [editId, setEditId] = useState(null);

  /* ================= FILTER ================= */

  const filteredTherapists = useMemo(() => {
    const value = search.toLowerCase().trim();

    return therapists.filter((therapist) => {
      return (
        therapist.name.toLowerCase().includes(value) ||
        therapist.mobile.includes(value)
      );
    });
  }, [therapists, search]);

  /* ================= COUNTS ================= */

  const totalTherapists = therapists.length;

  const availableCount = therapists.filter(
    (therapist) => therapist.status === "Available"
  ).length;

  const busyCount = therapists.filter(
    (therapist) => therapist.status === "Busy"
  ).length;

  /* ================= RESET FORM ================= */

  const resetForm = () => {
  setName("");
setMobile("");
setPassword("");
setStatus("Available");
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
  if (
  !name.trim() ||
  !mobile.trim() ||
  (!editId && !password)
) {
  alert(
    "Please enter therapist name, mobile number and password."
  );
  return;
}

if (password && password.length < 4) {
  alert(
    "Password must be at least 4 characters."
  );
  return;
}
  if (mobile.length !== 10) {
    alert(
      "Please enter a valid 10 digit mobile number."
    );
    return;
  }

  const duplicateMobile = therapists.some(
    (therapist) =>
      therapist.mobile === mobile &&
      therapist.id !== editId
  );

  if (duplicateMobile) {
    alert(
      "This mobile number is already registered."
    );
    return;
  }

  if (editId) {
  const success = await updateTherapist(editId, {
    name: name.trim(),
    mobile,
    status,
    ...(password ? { password } : {}),
  });

  if (success) {
    closeForm();
  }
} else {
  const success = await addTherapist({
    name: name.trim(),
    mobile,
    password,
    status,
  });

    if (success) {
      closeForm();
    }
  }
};
  /* ================= EDIT ================= */

  const handleEdit = (therapist) => {
    setName(therapist.name);
    setMobile(therapist.mobile);
    setStatus(therapist.status);
    setEditId(therapist.id);

    setShowForm(true);
  };

  /* ================= DELETE ================= */

  const handleDelete = async (therapist) => {
  if (therapist.status === "Busy") {
    alert(
      "Busy therapist cannot be deleted during an active session."
    );
    return;
  }

  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${therapist.name}?`
  );

  if (!confirmDelete) return;

  const success = await deleteTherapist(
    therapist.id
  );

  if (success) {
    alert("Therapist deleted successfully.");
  }
};
  return (
    <div className="therapists-page">
      {/* HEADER */}

      <div className="therapists-header">
        <div>
          <p className="therapists-label">
            THERAPIST MANAGEMENT
          </p>

          <h1>Therapists</h1>

          <p className="therapists-subtitle">
            Manage therapist records and availability.
          </p>
        </div>

        <button
          className="add-therapist-btn"
          onClick={openAddForm}
        >
          <span>＋</span>
          Add Therapist
        </button>
      </div>

      {/* STATS */}

      <div className="therapist-stats">
        <div className="therapist-stat-card">
          <span>Total Therapists</span>
          <strong>{totalTherapists}</strong>
        </div>

        <div className="therapist-stat-card">
          <span>Available</span>
          <strong>{availableCount}</strong>
        </div>

        <div className="therapist-stat-card">
          <span>Busy</span>
          <strong>{busyCount}</strong>
        </div>
      </div>

      {/* TABLE */}

      <div className="therapists-card">
        <div className="therapists-toolbar">
          <div className="therapists-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search therapist name or mobile..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        <div className="therapists-table-wrapper">
          <table className="therapists-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>NAME</th>
                <th>MOBILE NUMBER</th>
                <th>STATUS</th>
                <th>TODAY'S THERAPY</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredTherapists.map(
                (therapist, index) => (
                  <tr key={therapist.id}>
                    <td className="therapist-serial">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </td>

                    <td>
                      <div className="therapist-name-box">
                        <div className="therapist-name-avatar">
                          {therapist.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong>
                          {therapist.name}
                        </strong>
                      </div>
                    </td>

                    <td>
                      {therapist.mobile}
                    </td>

                    <td>
                      <span
                        className={
                          therapist.status ===
                          "Available"
                            ? "therapist-status available"
                            : "therapist-status busy"
                        }
                      >
                        <i></i>

                        {therapist.status}
                      </span>
                    </td>

                    <td>
                      <span className="therapy-count">
                        {therapist.todayTherapy ||
                          0}
                      </span>
                    </td>

                    <td>
                      <div className="therapist-actions">
                        <button
                          className="therapist-edit-btn"
                          onClick={() =>
                            handleEdit(therapist)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="therapist-delete-btn"
                          onClick={() =>
                            handleDelete(therapist)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {filteredTherapists.length ===
                0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="no-therapists"
                  >
                    No therapists found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT DRAWER */}

      {showForm && (
        <div
          className="therapist-form-overlay"
          onClick={closeForm}
        >
          <div
            className="therapist-form-drawer"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="therapist-form-header">
              <div>
                <p>
                  {editId
                    ? "EDIT THERAPIST"
                    : "ADD THERAPIST"}
                </p>

                <h2>
                  {editId
                    ? "Update Therapist"
                    : "New Therapist"}
                </h2>

                <span>
                  Enter therapist basic details.
                </span>
              </div>

              <button
                className="therapist-form-close"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <div className="therapist-form-content">
              <div className="therapist-form-group">
                <label>
                  Therapist Name *
                </label>

                <input
                  type="text"
                  placeholder="Enter therapist name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </div>

              <div className="therapist-form-group">
                <label>
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  maxLength="10"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />
              </div>

              <div className="therapist-form-group">
  <label>
    {editId ? "New Password" : "Password *"}
  </label>

  <input
    type="password"
    placeholder={
      editId
        ? "Leave blank to keep current password"
        : "Enter login password"
    }
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
</div>

              <div className="therapist-form-group">
                <label>
                  Status *
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >
                  <option value="Available">
                    Available
                  </option>

                  <option value="Busy">
                    Busy
                  </option>
                </select>
              </div>
            </div>

            <div className="therapist-form-footer">
              <button
                className="therapist-cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                className="therapist-save-btn"
                onClick={handleSave}
              >
                {editId
                  ? "Update Therapist"
                  : "Add Therapist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Therapists;