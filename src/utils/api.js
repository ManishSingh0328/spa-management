const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => {
  return (
    localStorage.getItem("spaToken") ||
    sessionStorage.getItem("spaToken")
  );
};

const clearAuth = () => {
  localStorage.removeItem("spaToken");
  localStorage.removeItem("spaAdmin");

  sessionStorage.removeItem("spaToken");
  sessionStorage.removeItem("spaAdmin");
};

export const apiFetch = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        ...(options.headers || {}),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  if (response.status === 401) {
    clearAuth();

    // Avoid infinite refresh on login page
    if (window.location.pathname !== "/") {
      window.location.replace("/");
    }

    throw new Error("Session expired.");
  }

  return response;
};