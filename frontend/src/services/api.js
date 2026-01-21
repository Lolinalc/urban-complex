import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth services
export const authService = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/updateprofile", data),
  updatePassword: (data) => api.put("/auth/updatepassword", data),
};

// Class services
export const classService = {
  getAll: (filters) => api.get("/classes", { params: filters }),
  getById: (id) => api.get(`/classes/${id}`),
  getWeeklySchedule: () => api.get("/classes/schedule/weekly"),
  create: (data) => api.post("/classes", data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
};

// Booking services
export const bookingService = {
  create: (data) => api.post("/bookings", data),
  getMyBookings: (filters) =>
    api.get("/bookings/my-bookings", { params: filters }),
  getAll: (filters) => api.get("/bookings", { params: filters }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  markAttendance: (id, attended) =>
    api.put(`/bookings/${id}/attendance`, { attended }),
  getStats: () => api.get("/bookings/stats/overview"),
};

// Payment services
export const paymentService = {
  createIntent: (data) => api.post("/payments/create-intent", data),
  confirmPayment: (id) => api.post(`/payments/${id}/confirm`),
  getMyPayments: () => api.get("/payments/my-payments"),
  getAll: (filters) => api.get("/payments", { params: filters }),
  getById: (id) => api.get(`/payments/${id}`),
  createManual: (data) => api.post("/payments/manual", data),
  getStats: () => api.get("/payments/stats/overview"),
};

// User services (Admin)
export const userService = {
  getAll: (filters) => api.get("/users", { params: filters }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get("/users/stats/overview"),
};

export default api;
