import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>URBAN COMPLEX</h1>
          <p className="hero-subtitle">Escuela de Danza</p>
          <p className="hero-description">
            Descubre tu pasión por el baile. Clases de Ballet, Jazz, Urbano,
            Acro Dance, Heels, Hip Hop y K-Pop para todas las edades.
          </p>
          {!user ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Regístrate Ahora
              </Link>
              <Link to="/schedule" className="btn btn-secondary">
                Ver Horario
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/schedule" className="btn btn-primary">
                Reservar Clase
              </Link>
              <Link to="/my-bookings" className="btn btn-secondary">
                Mis Clases
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="disciplines">
        <h2>Nuestras Disciplinas</h2>
        <div className="disciplines-grid">
          <div className="discipline-card">
            <h3>Ballet</h3>
            <p>Técnica clásica para niños de 4-8 años</p>
          </div>
          <div className="discipline-card">
            <h3>Acro Dance</h3>
            <p>Combinación de danza y acrobacia</p>
          </div>
          <div className="discipline-card">
            <h3>Jazz</h3>
            <p>Para teens y adultos de todos los niveles</p>
          </div>
          <div className="discipline-card">
            <h3>Urbano</h3>
            <p>Hip hop y estilos urbanos contemporáneos</p>
          </div>
          <div className="discipline-card">
            <h3>Heels</h3>
            <p>Danza en tacones para adultos</p>
          </div>
          <div className="discipline-card">
            <h3>K-Pop</h3>
            <p>Coreografías de tus grupos favoritos</p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <h2>¿Por qué elegir Urban Complex?</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>Maestros Profesionales</h3>
            <p>Instructores certificados con amplia experiencia</p>
          </div>
          <div className="info-card">
            <h3>Instalaciones Modernas</h3>
            <p>2 salones equipados con tecnología de punta</p>
          </div>
          <div className="info-card">
            <h3>Grupos Reducidos</h3>
            <p>Atención personalizada en cada clase</p>
          </div>
          <div className="info-card">
            <h3>Sistema Online</h3>
            <p>Reserva y paga tus clases fácilmente</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>¿Listo para comenzar?</h2>
        <p>Únete a nuestra comunidad de bailarines</p>
        {!user && (
          <Link to="/register" className="btn btn-large btn-primary">
            Crear Cuenta Gratis
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;
