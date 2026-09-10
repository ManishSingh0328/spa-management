import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "../utils/api";
const SpaContext = createContext();

/* ================= DEFAULT THERAPISTS ================= */

const defaultTherapists = [
  {
    id: 1,
    name: "Raman Sharma",
    mobile: "9876543210",
    status: "Available",
    todayTherapy: 3,
  },
  {
    id: 2,
    name: "Priya Sharma",
    mobile: "9823456789",
    status: "Available",
    todayTherapy: 2,
  },
  {
    id: 3,
    name: "Anjali Mehta",
    mobile: "9912345678",
    status: "Available",
    todayTherapy: 4,
  },
];

/* ================= DEFAULT ROOMS ================= */

const defaultRooms = [
  {
    id: 1,
    name: "Room 01",
    status: "Available",
  },
  {


    id: 2,
    name: "Room 02",
    status: "Available",
  },
  {
    id: 3,
    name: "Room 03",
    status: "Available",
  },
  {
    id: 4,
    name: "Room 04",
    status: "Available",
  },
];

/* ================= PROVIDER ================= */

export function SpaProvider({ children }) {
  /* ================= BOOKINGS ================= */

  const [bookings, setBookings] = useState([]);

  /* ================= THERAPISTS ================= */

 const [therapists, setTherapists] = useState([]);
 /* ================= LOAD THERAPISTS FROM BACKEND ================= */

useEffect(() => {
  const loadTherapists = async () => {
    try {
      const response = await apiFetch("/api/therapists");
      const result = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to load therapists:",
          result.message
        );
        return;
      }

      const backendTherapists = result.data.map(
        (therapist) => ({
          ...therapist,
          id: therapist._id,
          status: "Available",
          todayTherapy: 0,
        })
      );

      setTherapists(backendTherapists);
    } catch (error) {
      console.error(
        "Load Therapists Error:",
        error
      );
    }
  };

  loadTherapists();
}, []);
/* ================= SYNC THERAPIST STATUS ================= */

useEffect(() => {
  const today = new Date();

  const todayDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  setTherapists((previous) =>
    previous.map((therapist) => {
      const isBusy = bookings.some(
        (booking) =>
          booking.status === "In Service" &&
          booking.therapist === therapist.name
      );

      const todayCompletedCount =
        bookings.filter(
          (booking) =>
            booking.status === "Completed" &&
            booking.therapist === therapist.name &&
            booking.date === todayDate
        ).length;

      return {
        ...therapist,
        status: isBusy ? "Busy" : "Available",
        todayTherapy: todayCompletedCount,
      };
    })
  );
}, [bookings, therapists.length]);

  /* ================= ROOMS ================= */
const [rooms, setRooms] = useState([]);
/* ================= LOAD ROOMS FROM BACKEND ================= */

useEffect(() => {
  const loadRooms = async () => {
    try
     {const response = await apiFetch("/api/rooms");
      const result = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to load rooms:",
          result.message
        );
        return;
      }

      const backendRooms = result.data.map(
        (room) => ({
          ...room,
          id: room._id,
          status: "Available",
        })
      );

      setRooms(backendRooms);
    } catch (error) {
      console.error(
        "Load Rooms Error:",
        error
      );
    }
  };

  loadRooms();
}, []);
/* ================= SYNC ROOM STATUS ================= */

useEffect(() => {
  setRooms((previous) =>
    previous.map((room) => {
      const isOccupied = bookings.some(
        (booking) =>
          booking.status === "In Service" &&
          booking.room === room.name
      );

      return {
        ...room,
        status: isOccupied
          ? "Occupied"
          : "Available",
      };
    })
  );
}, [bookings, rooms.length]);
  /* ================= GET BOOKINGS FROM BACKEND ================= */

useEffect(() => {
  const fetchBookings = async () => {
    try {
    const response = await apiFetch("/api/bookings");


      const result = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to load bookings:",
          result.message
        );
        return;
      }

      const backendBookings = result.data.map(
        (booking) => ({
          ...booking,

          id: booking._id,

          startedAt: booking.startedAt
            ? new Date(
                booking.startedAt
              ).getTime()
            : null,

          endAt: booking.endAt
            ? new Date(
                booking.endAt
              ).getTime()
            : null,

          completedAt: booking.completedAt
            ? new Date(
                booking.completedAt
              ).getTime()
            : null,
        })
      );

      /* ===== LOAD BOOKINGS ===== */

      setBookings(backendBookings);

      /* ===== FIND ACTIVE BOOKINGS ===== */

      const activeBookings =
        backendBookings.filter(
          (booking) =>
            booking.status === "In Service"
        );

  /* ===== SYNC THERAPISTS ===== */

const today = new Date();
const todayDate = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

setTherapists((previous) =>
  previous.map((therapist) => {
    const isBusy = activeBookings.some(
      (booking) =>
        booking.therapist === therapist.name
    );

    const todayCompletedCount =
      backendBookings.filter(
        (booking) =>
          booking.status === "Completed" &&
          booking.therapist === therapist.name &&
          booking.date === todayDate
      ).length;

    return {
      ...therapist,
      status: isBusy ? "Busy" : "Available",
      todayTherapy: todayCompletedCount,
    };
  })
);
      /* ===== SYNC ROOMS ===== */

      setRooms((previous) =>
        previous.map((room) => {
          const isOccupied =
            activeBookings.some(
              (booking) =>
                booking.room === room.name
            );

          return {
            ...room,
            status: isOccupied
              ? "Occupied"
              : "Available",
          };
        })
      );
    } catch (error) {
      console.error(
        "Booking fetch error:",
        error
      );
    }
  };

  fetchBookings();
}, []);

 /* ================= ADD BOOKING ================= */

  const addBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,

      id:
        bookingData._id ||
        bookingData.id ||
        Date.now(),

      status:
        bookingData.status || "Upcoming",

      startedAt: bookingData.startedAt
        ? new Date(
            bookingData.startedAt
          ).getTime()
        : null,

      endAt: bookingData.endAt
        ? new Date(
            bookingData.endAt
          ).getTime()
        : null,

      completedAt: bookingData.completedAt
        ? new Date(
            bookingData.completedAt
          ).getTime()
        : null,
    };

    setBookings((previous) => [
      ...previous,
      newBooking,
    ]);
  };
/* ================= UPDATE BOOKING ================= */

const updateBooking = (updatedBookingData) => {
  const normalizedBooking = {
    ...updatedBookingData,

    id:
      updatedBookingData._id ||
      updatedBookingData.id,

    startedAt: updatedBookingData.startedAt
      ? new Date(
          updatedBookingData.startedAt
        ).getTime()
      : null,

    endAt: updatedBookingData.endAt
      ? new Date(
          updatedBookingData.endAt
        ).getTime()
      : null,

    completedAt: updatedBookingData.completedAt
      ? new Date(
          updatedBookingData.completedAt
        ).getTime()
      : null,
  };

  setBookings((previous) =>
    previous.map((booking) =>
      booking.id === normalizedBooking.id
        ? normalizedBooking
        : booking
    )
  );
};
  /* ================= START SESSION ================= */

const startSession = async (bookingId) => {
  const booking = bookings.find(
    (item) => item.id === bookingId
  );

  if (!booking) {
    alert("Booking not found.");
    return;
  }

  if (booking.status !== "Upcoming") {
    return;
  }

  const therapist = therapists.find(
    (item) => item.name === booking.therapist
  );

  const room = rooms.find(
    (item) => item.name === booking.room
  );

  if (
    therapist &&
    therapist.status === "Busy"
  ) {
    alert(
      `${therapist.name} is already busy.`
    );
    return;
  }

  if (
    room &&
    room.status === "Occupied"
  ) {
    alert(
      `${room.name} is already occupied.`
    );
    return;
  }

  try {
 const response = await apiFetch(
  `/api/bookings/${bookingId}/start`,
  {
    method: "PATCH",
  }
);

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.message ||
          "Failed to start session."
      );
      return;
    }

    const updatedBooking = {
      ...result.data,
      id: result.data._id,

      startedAt: result.data.startedAt
        ? new Date(
            result.data.startedAt
          ).getTime()
        : null,

      endAt: result.data.endAt
        ? new Date(
            result.data.endAt
          ).getTime()
        : null,

      completedAt: result.data.completedAt
        ? new Date(
            result.data.completedAt
          ).getTime()
        : null,
    };

    setBookings((previous) =>
      previous.map((item) =>
        item.id === bookingId
          ? updatedBooking
          : item
      )
    );

    setTherapists((previous) =>
      previous.map((item) =>
        item.name === booking.therapist
          ? {
              ...item,
              status: "Busy",
            }
          : item
      )
    );

    setRooms((previous) =>
      previous.map((item) =>
        item.name === booking.room
          ? {
              ...item,
              status: "Occupied",
            }
          : item
      )
    );
  } catch (error) {
    console.error(
      "Start Session Error:",
      error
    );

    alert(
      "Backend server connection failed."
    );
  }
};
/* ================= SWITCH ACTIVE SESSION ================= */

const switchActiveSession = async (
  bookingId,
  newTherapist,
  newRoom
) => {
  const booking = bookings.find(
    (item) => item.id === bookingId
  );

  if (!booking) {
    alert("Booking not found.");
    return false;
  }

  if (booking.status !== "In Service") {
    alert("Session is not active.");
    return false;
  }

  const oldTherapist = booking.therapist;
  const oldRoom = booking.room;

  const therapistChanged =
    newTherapist &&
    newTherapist !== oldTherapist;

  const roomChanged =
    newRoom &&
    newRoom !== oldRoom;

  if (!therapistChanged && !roomChanged) {
    alert("No changes selected.");
    return false;
  }

  if (therapistChanged) {
    const therapist = therapists.find(
      (item) => item.name === newTherapist
    );

    if (!therapist) {
      alert("Therapist not found.");
      return false;
    }

    if (therapist.status === "Busy") {
      alert(
        `${newTherapist} is already busy.`
      );
      return false;
    }
  }

  if (roomChanged) {
    const room = rooms.find(
      (item) => item.name === newRoom
    );

    if (!room) {
      alert("Room not found.");
      return false;
    }

    if (room.status === "Occupied") {
      alert(
        `${newRoom} is already occupied.`
      );
      return false;
    }
  }

  try {
   const response = await apiFetch(
  `/api/bookings/${bookingId}/switch`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      therapist: newTherapist,
      room: newRoom,
    }),
  }
);s
    const result = await response.json();

    if (!response.ok) {
      alert(
        result.message ||
          "Failed to change active session."
      );
      return false;
    }

    const updatedBooking = {
      ...result.data,

      id: result.data._id,

      startedAt: result.data.startedAt
        ? new Date(
            result.data.startedAt
          ).getTime()
        : null,

      endAt: result.data.endAt
        ? new Date(
            result.data.endAt
          ).getTime()
        : null,

      completedAt: result.data.completedAt
        ? new Date(
            result.data.completedAt
          ).getTime()
        : null,
    };

    setBookings((previous) =>
      previous.map((item) =>
        item.id === bookingId
          ? updatedBooking
          : item
      )
    );

    /* ===== THERAPIST SWITCH ===== */

    if (therapistChanged) {
      setTherapists((previous) =>
        previous.map((therapist) => {
          if (
            therapist.name === oldTherapist
          ) {
            return {
              ...therapist,
              status: "Available",
            };
          }

          if (
            therapist.name === newTherapist
          ) {
            return {
              ...therapist,
              status: "Busy",
            };
          }

          return therapist;
        })
      );
    }

    /* ===== ROOM SWITCH ===== */

    if (roomChanged) {
      setRooms((previous) =>
        previous.map((room) => {
          if (room.name === oldRoom) {
            return {
              ...room,
              status: "Available",
            };
          }

          if (room.name === newRoom) {
            return {
              ...room,
              status: "Occupied",
            };
          }

          return room;
        })
      );
    }

    return true;
  } catch (error) {
    console.error(
      "Switch Active Session Error:",
      error
    );

    alert(
      "Backend server connection failed."
    );

    return false;
  }
};

  /* ================= COMPLETE SESSION ================= */

 const completeSession = async (bookingId) => {
  const booking = bookings.find(
    (item) => item.id === bookingId
  );

  if (!booking) {
    alert("Booking not found.");
    return;
  }

  if (booking.status !== "In Service") {
    return;
  }

  try {
     const response = await apiFetch(
  `/api/bookings/${bookingId}/complete`,
  {
    method: "PATCH",
  }
);
    const result = await response.json();

    if (!response.ok) {
      alert(
        result.message ||
          "Failed to complete session."
      );
      return;
    }

    const updatedBooking = {
      ...result.data,
      id: result.data._id,

      startedAt: result.data.startedAt
        ? new Date(result.data.startedAt).getTime()
        : null,

      endAt: result.data.endAt
        ? new Date(result.data.endAt).getTime()
        : null,

      completedAt: result.data.completedAt
        ? new Date(result.data.completedAt).getTime()
        : null,
    };

    setBookings((previous) =>
      previous.map((item) =>
        item.id === bookingId
          ? updatedBooking
          : item
      )
    );

    setTherapists((previous) =>
      previous.map((item) =>
        item.name === booking.therapist
          ? {
              ...item,
              status: "Available",
              todayTherapy:
                Number(item.todayTherapy || 0) + 1,
            }
          : item
      )
    );

    setRooms((previous) =>
      previous.map((item) =>
        item.name === booking.room
          ? {
              ...item,
              status: "Available",
            }
          : item
      )
    );
  } catch (error) {
    console.error(
      "Complete Session Error:",
      error
    );

    alert("Backend server connection failed.");
  }
};
/* ================= AUTO COMPLETE ================= */

useEffect(() => {
  const interval = setInterval(async () => {
    const now = Date.now();

    const expiredBookings = bookings.filter(
      (booking) =>
        booking.status === "In Service" &&
        booking.endAt &&
        now >= booking.endAt
    );

    if (expiredBookings.length === 0) {
      return;
    }

    for (const booking of expiredBookings) {
      await completeSession(booking.id);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [bookings]);
  /* ================= THERAPISTS ================= */

  const addTherapist = async (therapistData) => {
  try {
   const response = await apiFetch(
  "/api/therapists",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    
  body: JSON.stringify({
  name: therapistData.name,
  mobile: therapistData.mobile,
  password: therapistData.password,

}),
}
);

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.message ||
          "Failed to add therapist."
      );
      return false;
    }

    const newTherapist = {
      ...result.data,
      id: result.data._id,
      status: "Available",
      todayTherapy: 0,
    };

    setTherapists((previous) => [
      ...previous,
      newTherapist,
    ]);

    return true;
  } catch (error) {
    console.error(
      "Add Therapist Error:",
      error
    );

    alert("Backend server connection failed.");
    return false;
  }
};

  const updateTherapist = async (
  id,
  updatedData
) => {
  try {
    const response = await apiFetch(
  `/api/therapists/${id}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  name: updatedData.name,
  mobile: updatedData.mobile,
  ...(updatedData.password
    ? { password: updatedData.password }
    : {}),
}),
  }
);

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.message ||
          "Failed to update therapist."
      );
      return false;
    }

    const updatedTherapist = {
      ...result.data,
      id: result.data._id,
      status:
        updatedData.status || "Available",
    };

    setTherapists((previous) =>
      previous.map((therapist) =>
        therapist.id === id
          ? {
              ...therapist,
              ...updatedTherapist,
            }
          : therapist
      )
    );

    return true;
  } catch (error) {
    console.error(
      "Update Therapist Error:",
      error
    );

    alert("Backend server connection failed.");
    return false;
  }
};

  const deleteTherapist = async (id) => {
  try {
   const response = await apiFetch(
  `/api/therapists/${id}`,
  {
    method: "DELETE",
  }
);

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.message ||
          "Failed to delete therapist."
      );
      return false;
    }

    setTherapists((previous) =>
      previous.filter(
        (therapist) =>
          therapist.id !== id
      )
    );

    return true;
  } catch (error) {
    console.error(
      "Delete Therapist Error:",
      error
    );

    alert("Backend server connection failed.");
    return false;
  }
};
  /* ================= ROOMS ================= */

 const addRoom = async (roomName) => {
  const cleanRoomName = roomName.trim();

  const alreadyExists = rooms.some(
    (room) =>
      room.name.toLowerCase() ===
      cleanRoomName.toLowerCase()
  );

  if (alreadyExists) {
    alert("Room already exists.");
    return false;
  }

  try {
   const response = await apiFetch(
  "/api/rooms",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: cleanRoomName,
    }),
  }
);
    const result = await response.json();

    if (!response.ok) {
      alert(
        result.message ||
          "Failed to add room."
      );
      return false;
    }

    const newRoom = {
      ...result.data,
      id: result.data._id,
      status: "Available",
    };

    setRooms((previous) => [
      ...previous,
      newRoom,
    ]);

    return true;
  } catch (error) {
    console.error(
      "Add Room Error:",
      error
    );

    alert("Backend server connection failed.");
    return false;
  }
};
  const deleteRoom = async (id) => {
  const room = rooms.find(
    (item) => item.id === id
  );

  if (!room) {
    return false;
  }

  if (room.status === "Occupied") {
    alert(
      "Occupied room cannot be deleted."
    );
    return false;
  }

  try {
    const response = await apiFetch(
  `/api/rooms/${id}`,
  {
    method: "DELETE",
  }
);

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.message ||
          "Failed to delete room."
      );
      return false;
    }

    setRooms((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    return true;
  } catch (error) {
    console.error(
      "Delete Room Error:",
      error
    );

    alert("Backend server connection failed.");
    return false;
  }
};
  /* ================= PROVIDER ================= */

  return (
    <SpaContext.Provider
      value={{
        bookings,
        addBooking,
        updateBooking,
        startSession,
        switchActiveSession,
        completeSession,

        therapists,
        addTherapist,
        updateTherapist,
        deleteTherapist,

        rooms,
        addRoom,
        deleteRoom,
      }}
    >
      {children}
    </SpaContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useSpa() {
  const context =
    useContext(SpaContext);

  if (!context) {
    throw new Error(
      "useSpa must be used inside SpaProvider"
    );
  }

  return context;
}