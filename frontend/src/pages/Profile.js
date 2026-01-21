import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { packageService, bookingService, classService } from "../services/api";
import ProfileInfo from "../components/profile/ProfileInfo";
import MyPackages from "../components/profile/MyPackages";
import UpcomingBookings from "../components/profile/UpcomingBookings";
import ClassHistory from "../components/profile/ClassHistory";
import PaymentHistory from "../components/profile/PaymentHistory";
import "../assets/styles/Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState({
    activePackage: null,
    todayClasses: [],
    upcomingBookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchDashboardData();
    }
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Obtener paquete activo
      const packageRes = await packageService.getMyActivePackage();

      // Obtener clases de hoy
      const today = new Date();
      const dayOfWeek = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ][today.getDay()];
      const classesRes = await classService.getAll({
        dayOfWeek,
        isActive: true,
      });

      // Obtener próximas reservas
      const bookingsRes = await bookingService.getMyBookings({
        upcoming: "true",
      });

      setDashboardData({
        activePackage: packageRes.data.data,
        todayClasses: classesRes.data.data,
        upcomingBookings: bookingsRes.data.data.slice(0, 3),
      });
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard data={dashboardData} loading={loading} />;
      case "profile":
        return <ProfileInfo />;
      case "packages":
        return <MyPackages />;
      case "bookings":
        return <UpcomingBookings />;
      case "history":
        return <ClassHistory />;
      case "payments":
        return <PaymentHistory />;
      default:
        return <Dashboard data={dashboardData} loading={loading} />;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-sidebar">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <div className="profile-user-info">
            <h3>
              {user.firstName} {user.lastName}
            </h3>
            <p>{user.email}</p>
            <span className="badge badge-active">Vigente</span>
          </div>
        </div>

        <nav className="profile-nav">
          <button
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => setActiveSection("dashboard")}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
          </button>
          <button
            className={activeSection === "profile" ? "active" : ""}
            onClick={() => setActiveSection("profile")}
          >
            <span className="nav-icon">👤</span>
            Mi perfil
          </button>
          <button
            className={activeSection === "packages" ? "active" : ""}
            onClick={() => setActiveSection("packages")}
          >
            <span className="nav-icon">📦</span>
            Mis paquetes
          </button>
          <button
            className={activeSection === "bookings" ? "active" : ""}
            onClick={() => setActiveSection("bookings")}
          >
            <span className="nav-icon">📅</span>
            Próximas reservas
          </button>
          <button
            className={activeSection === "history" ? "active" : ""}
            onClick={() => setActiveSection("history")}
          >
            <span className="nav-icon">📋</span>
            Historial de clases
          </button>
          <button
            className={activeSection === "payments" ? "active" : ""}
            onClick={() => setActiveSection("payments")}
          >
            <span className="nav-icon">💳</span>
            Pagos
          </button>
        </nav>
      </div>

      <div className="profile-content">{renderContent()}</div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ data, loading }) => {
  if (loading) return <div className="loading">Cargando...</div>;

  const { activePackage, todayClasses, upcomingBookings } = data;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Mensaje de bienvenida */}
      {upcomingBookings.length === 0 && (
        <div className="welcome-message">
          <h2>Aún no tienes ninguna reserva</h2>
          <p>Explora nuestras clases disponibles y reserva tu lugar</p>
        </div>
      )}

      {/* Clases disponibles de hoy */}
      <section className="today-classes">
        <div className="section-header">
          <h2>Clases disponibles de hoy</h2>
          <a href="/schedule" className="link-btn">
            Ver calendario
          </a>
        </div>

        {todayClasses.length === 0 ? (
          <p className="empty-message">No hay clases programadas para hoy</p>
        ) : (
          <div className="classes-grid">
            {todayClasses.map((cls) => (
              <ClassCard key={cls._id} classData={cls} />
            ))}
          </div>
        )}
      </section>

      {/* Plan predeterminado */}
      <section className="active-package-section">
        <div className="section-header">
          <h2>Plan predeterminado</h2>
          <a href="/packages" className="link-btn">
            Ver mis planes
          </a>
        </div>

        {activePackage ? (
          <div className="package-card-large">
            <div className="package-name">
              {activePackage.package.name}
              <span className="badge-default">Default</span>
            </div>
            <div className="package-stats">
              <div className="stat">
                <span className="stat-label">Total</span>
                <span className="stat-value">{activePackage.totalClasses}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Disponible</span>
                <span className="stat-value">
                  {activePackage.remainingClasses}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Vigencia</span>
                <span className="stat-value">
                  {new Date(activePackage.expiryDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-package">
            <p>No tienes un paquete activo</p>
            <a href="/packages" className="btn btn-primary">
              Comprar paquete
            </a>
          </div>
        )}
      </section>

      {/* Próximas reservas */}
      {upcomingBookings.length > 0 && (
        <section className="upcoming-section">
          <div className="section-header">
            <h2>Próximas clases</h2>
            <a href="/my-bookings" className="link-btn">
              Ver todas
            </a>
          </div>

          <div className="bookings-list-compact">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="booking-item-compact">
                <div className="booking-date-time">
                  <span className="booking-day">
                    {new Date(booking.date).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="booking-time">
                    {booking.class.startTime}
                  </span>
                </div>
                <div className="booking-info">
                  <h4>{booking.class.name}</h4>
                  <p>{booking.class.discipline}</p>
                </div>
                <span className={`badge badge-${booking.status}`}>
                  {booking.status === "confirmed" && "Confirmada"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ClassCard Component
const ClassCard = ({ classData }) => {
  const availableSpots = classData.maxCapacity - classData.currentEnrollment;
  const isFull = availableSpots === 0;

  return (
    <div className="class-card-dashboard">
      <div className="class-icon">💃</div>
      <div className="class-details">
        <h3>{classData.discipline}</h3>
        <p className="class-time">
          {classData.dayOfWeek.charAt(0).toUpperCase() +
            classData.dayOfWeek.slice(1)}{" "}
          {classData.startTime}
        </p>
        <p className="class-time-end">{classData.endTime}</p>
      </div>
      {!isFull ? (
        <a href={`/schedule?class=${classData._id}`} className="btn-reserve">
          Reservar
        </a>
      ) : (
        <span className="badge-full">Lleno</span>
      )}
    </div>
  );
};

export default Profile;
