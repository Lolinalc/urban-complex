import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          URBAN COMPLEX
        </Link>

        <ul className="navbar-menu">
          <li><Link to="/schedule">Horario</Link></li>

          {!user ? (
            <>
              <li><Link to="/login">Iniciar Sesión</Link></li>
              <li><Link to="/register" className="btn-primary">Registrarse</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/my-bookings">Mis Clases</Link></li>
              <li><Link to="/my-payments">Mis Pagos</Link></li>

              {isAdmin() && (
                <li><Link to="/admin">Admin</Link></li>
              )}

              <li><Link to="/profile">Mi Perfil</Link></li>
              <li>
                <button onClick={handleLogout} className="btn-logout">
                  Cerrar Sesión
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
