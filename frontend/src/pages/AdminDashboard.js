import React, { useState, useEffect } from 'react';
import { userService, bookingService, paymentService, classService } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes, bookingsRes] = await Promise.all([
        userService.getStats(),
        userService.getAll({ role: 'student' }),
        bookingService.getAll({ status: 'confirmed' })
      ]);

      setStats(statsRes.data.data);
      setStudents(studentsRes.data.data);
      setBookings(bookingsRes.data.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>

      <div className="admin-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Resumen
        </button>
        <button
          className={activeTab === 'students' ? 'active' : ''}
          onClick={() => setActiveTab('students')}
        >
          Estudiantes
        </button>
        <button
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          Reservas
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Estudiantes</h3>
              <p className="stat-number">{stats.totalStudents}</p>
            </div>
            <div className="stat-card">
              <h3>Estudiantes Activos</h3>
              <p className="stat-number">{stats.activeStudents}</p>
            </div>
            <div className="stat-card">
              <h3>Reservas Confirmadas</h3>
              <p className="stat-number">{stats.upcomingBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Ingresos este Mes</h3>
              <p className="stat-number">${stats.thisMonthRevenue || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Ingresos Totales</h3>
              <p className="stat-number">${stats.totalRevenue || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Nuevos este Mes</h3>
              <p className="stat-number">{stats.newStudentsThisMonth}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="admin-content">
          <h2>Lista de Estudiantes ({students.length})</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.email}</td>
                    <td>{student.phone || '-'}</td>
                    <td>
                      <span className={`badge badge-${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="admin-content">
          <h2>Reservas Confirmadas ({bookings.length})</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Clase</th>
                  <th>Fecha</th>
                  <th>Maestro/a</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking.user.firstName} {booking.user.lastName}</td>
                    <td>{booking.class.name}</td>
                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                    <td>{booking.class.teacher}</td>
                    <td>
                      <span className={`badge badge-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
