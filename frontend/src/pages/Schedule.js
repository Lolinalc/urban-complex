import React, { useState, useEffect } from 'react';
import { classService, bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Schedule = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingClass, setBookingClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const { user } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll({ isActive: true });
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (classItem) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Debes iniciar sesión para reservar' });
      return;
    }

    setBookingClass(classItem);

    // Obtener la próxima fecha para este día de la semana
    const nextDate = getNextDateForDay(classItem.dayOfWeek);
    setSelectedDate(nextDate);
  };

  const getNextDateForDay = (dayOfWeek) => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const targetDay = days.indexOf(dayOfWeek.toLowerCase());
    const today = new Date();
    const currentDay = today.getDay();

    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);

    return nextDate.toISOString().split('T')[0];
  };

  const confirmBooking = async () => {
    try {
      await bookingService.create({
        classId: bookingClass._id,
        date: selectedDate
      });

      setMessage({ type: 'success', text: 'Clase reservada exitosamente' });
      setBookingClass(null);
      fetchClasses();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al reservar clase'
      });
    }
  };

  const groupByDay = () => {
    const grouped = {};
    classes.forEach(cls => {
      if (!grouped[cls.dayOfWeek]) {
        grouped[cls.dayOfWeek] = [];
      }
      grouped[cls.dayOfWeek].push(cls);
    });
    return grouped;
  };

  const daysOrder = ['lunes', 'martes', 'miércoles', 'jueves'];

  if (loading) return <div className="loading">Cargando horario...</div>;

  return (
    <div className="schedule-page">
      <h1>Horario de Clases</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="schedule-grid">
        {daysOrder.map(day => {
          const dayClasses = groupByDay()[day] || [];
          return (
            <div key={day} className="schedule-day">
              <h2>{day.charAt(0).toUpperCase() + day.slice(1)}</h2>
              <div className="classes-list">
                {dayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(cls => (
                  <div key={cls._id} className="class-card">
                    <div className="class-time">{cls.startTime}</div>
                    <h3>{cls.name}</h3>
                    <p className="class-discipline">{cls.discipline}</p>
                    <p className="class-teacher">Maestro/a: {cls.teacher}</p>
                    <p className="class-info">
                      Salón {cls.salon} | {cls.level} | {cls.ageGroup}
                    </p>
                    <p className="class-capacity">
                      {cls.maxCapacity - cls.currentEnrollment} cupos disponibles
                    </p>

                    {user && cls.currentEnrollment < cls.maxCapacity && (
                      <button
                        onClick={() => handleBookClass(cls)}
                        className="btn btn-primary btn-sm"
                      >
                        Reservar
                      </button>
                    )}
                    {cls.currentEnrollment >= cls.maxCapacity && (
                      <span className="badge badge-full">Lleno</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {bookingClass && (
        <div className="modal-overlay" onClick={() => setBookingClass(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirmar Reserva</h2>
            <p><strong>{bookingClass.name}</strong></p>
            <p>{bookingClass.discipline}</p>
            <p>Maestro/a: {bookingClass.teacher}</p>
            <p>{bookingClass.dayOfWeek} a las {bookingClass.startTime}</p>

            <div className="form-group">
              <label>Fecha de la clase:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="modal-buttons">
              <button onClick={confirmBooking} className="btn btn-primary">
                Confirmar Reserva
              </button>
              <button onClick={() => setBookingClass(null)} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
