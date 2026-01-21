import React, { useState, useEffect } from "react";
import { bookingService } from "../../services/api";

const UpcomingBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getMyBookings({ upcoming: "true" });
      setBookings(response.data.data);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return;
    }

    try {
      await bookingService.cancel(bookingId, "Cancelado por el usuario");
      setMessage({ type: "success", text: "Reserva cancelada exitosamente" });
      fetchBookings();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al cancelar reserva",
      });
    }
  };

  if (loading) return <div className="loading">Cargando reservas...</div>;

  return (
    <div className="upcoming-bookings">
      <h1>Próximas Reservas</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No tienes reservas próximas</p>
          <a href="/schedule" className="btn btn-primary">
            Ver horario de clases
          </a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ booking, onCancel }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = () => {
    const today = new Date();
    const bookingDate = new Date(booking.date);
    return today.toDateString() === bookingDate.toDateString();
  };

  return (
    <div
      className={`booking-card-detailed ${isToday() ? "booking-today" : ""}`}
    >
      {isToday() && <div className="badge-today">Hoy</div>}

      <div className="booking-main-info">
        <div className="booking-icon">💃</div>
        <div className="booking-details">
          <h3>{booking.class.name}</h3>
          <p className="booking-discipline">{booking.class.discipline}</p>
          <p className="booking-teacher">Maestro/a: {booking.class.teacher}</p>
          <p className="booking-location">Salón {booking.class.salon}</p>
        </div>
      </div>

      <div className="booking-time-info">
        <div className="booking-date">{formatDate(booking.date)}</div>
        <div className="booking-time">
          {booking.class.startTime} - {booking.class.endTime}
        </div>
      </div>

      <div className="booking-status">
        <span className={`badge badge-${booking.status}`}>
          {booking.status === "confirmed" && "Confirmada"}
        </span>
      </div>

      <div className="booking-actions">
        <button
          onClick={() => onCancel(booking._id)}
          className="btn btn-danger btn-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default UpcomingBookings;
