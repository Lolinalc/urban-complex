import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = filter === 'upcoming' ? { upcoming: 'true' } : {};
      const response = await bookingService.getMyBookings(params);
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await bookingService.cancel(bookingId, 'Cancelado por el usuario');
      setMessage({ type: 'success', text: 'Reserva cancelada exitosamente' });
      fetchBookings();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al cancelar reserva'
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Cargando tus clases...</div>;

  return (
    <div className="my-bookings-page">
      <h1>Mis Clases</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="filter-tabs">
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Próximas Clases
        </button>
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No tienes clases {filter === 'upcoming' ? 'próximas' : 'reservadas'}</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-status">
                <span className={`badge badge-${booking.status}`}>
                  {booking.status === 'confirmed' && 'Confirmada'}
                  {booking.status === 'cancelled' && 'Cancelada'}
                  {booking.status === 'completed' && 'Completada'}
                  {booking.status === 'no-show' && 'No asistió'}
                </span>
              </div>

              <h3>{booking.class.name}</h3>
              <p className="booking-discipline">{booking.class.discipline}</p>
              <p>Maestro/a: {booking.class.teacher}</p>
              <p>Salón {booking.class.salon}</p>
              <p>Horario: {booking.class.startTime} - {booking.class.endTime}</p>
              <p className="booking-date">{formatDate(booking.date)}</p>

              {booking.status === 'confirmed' && new Date(booking.date) > new Date() && (
                <button
                  onClick={() => handleCancelBooking(booking._id)}
                  className="btn btn-danger btn-sm"
                >
                  Cancelar Reserva
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
