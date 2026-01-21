import React, { useState, useEffect } from "react";
import { bookingService } from "../../services/api";

const ClassHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, completed, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filter, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getMyBookings({});
      // Filtrar solo clases pasadas
      const pastBookings = response.data.data.filter(
        (booking) => new Date(booking.date) < new Date(),
      );
      setBookings(pastBookings);
      setFilteredBookings(pastBookings);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (filter === "all") {
      setFilteredBookings(bookings);
    } else if (filter === "completed") {
      setFilteredBookings(
        bookings.filter((b) => b.status === "completed" || b.attended),
      );
    } else if (filter === "cancelled") {
      setFilteredBookings(bookings.filter((b) => b.status === "cancelled"));
    }
  };

  const getStats = () => {
    const completed = bookings.filter(
      (b) => b.status === "completed" || b.attended,
    ).length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const total = bookings.length;

    return { completed, cancelled, total };
  };

  if (loading) return <div className="loading">Cargando historial...</div>;

  const stats = getStats();

  return (
    <div className="class-history">
      <h1>Historial de Clases</h1>

      {/* Stats Cards */}
      <div className="stats-grid-compact">
        <div className="stat-card-compact">
          <span className="stat-label">Total de clases</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card-compact">
          <span className="stat-label">Completadas</span>
          <span className="stat-value text-success">{stats.completed}</span>
        </div>
        <div className="stat-card-compact">
          <span className="stat-label">Canceladas</span>
          <span className="stat-value text-danger">{stats.cancelled}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Todas ({bookings.length})
        </button>
        <button
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Completadas ({stats.completed})
        </button>
        <button
          className={filter === "cancelled" ? "active" : ""}
          onClick={() => setFilter("cancelled")}
        >
          Canceladas ({stats.cancelled})
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p>No hay clases en el historial</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredBookings.map((booking) => (
            <HistoryCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

const HistoryCard = ({ booking }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusDisplay = () => {
    if (booking.status === "completed" || booking.attended) {
      return { text: "Completada", class: "completed" };
    } else if (booking.status === "cancelled") {
      return { text: "Cancelada", class: "cancelled" };
    } else if (booking.status === "no-show") {
      return { text: "No asistió", class: "no-show" };
    }
    return { text: booking.status, class: booking.status };
  };

  const status = getStatusDisplay();

  return (
    <div className="history-card">
      <div className="history-date">{formatDate(booking.date)}</div>

      <div className="history-info">
        <h4>{booking.class.name}</h4>
        <p className="history-discipline">{booking.class.discipline}</p>
        <p className="history-teacher">Maestro/a: {booking.class.teacher}</p>
        <p className="history-time">
          {booking.class.startTime} - {booking.class.endTime}
        </p>
      </div>

      <div className="history-status">
        <span className={`badge badge-${status.class}`}>{status.text}</span>
      </div>
    </div>
  );
};

export default ClassHistory;
