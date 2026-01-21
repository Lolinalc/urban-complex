import React, { useState, useEffect } from "react";
import { packageService } from "../../services/api";

const MyPackages = () => {
  const [packages, setPackages] = useState([]);
  const [activePackages, setActivePackages] = useState([]);
  const [expiredPackages, setExpiredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageService.getMyPackages();
      const allPackages = response.data.data;

      setPackages(allPackages);
      setActivePackages(allPackages.filter((p) => p.status === "active"));
      setExpiredPackages(
        allPackages.filter(
          (p) => p.status === "expired" || p.status === "depleted",
        ),
      );
    } catch (error) {
      console.error("Error al cargar paquetes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (packageId) => {
    try {
      await packageService.setDefaultPackage(packageId);
      setMessage({
        type: "success",
        text: "Paquete establecido como predeterminado",
      });
      fetchPackages();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Error al establecer paquete predeterminado",
      });
    }
  };

  if (loading) return <div className="loading">Cargando paquetes...</div>;

  return (
    <div className="my-packages">
      <h1>Mis Paquetes</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Paquetes Activos */}
      <section className="packages-section">
        <h2>Paquetes Activos ({activePackages.length})</h2>

        {activePackages.length === 0 ? (
          <div className="empty-state">
            <p>No tienes paquetes activos</p>
            <a href="/packages/buy" className="btn btn-primary">
              Comprar paquete
            </a>
          </div>
        ) : (
          <div className="packages-grid">
            {activePackages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                userPackage={pkg}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}
      </section>

      {/* Paquetes Expirados/Agotados */}
      {expiredPackages.length > 0 && (
        <section className="packages-section">
          <h2>Historial de Paquetes ({expiredPackages.length})</h2>

          <div className="packages-grid">
            {expiredPackages.map((pkg) => (
              <PackageCard key={pkg._id} userPackage={pkg} isExpired={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Package Card Component
const PackageCard = ({ userPackage, onSetDefault, isExpired = false }) => {
  const {
    package: pkg,
    totalClasses,
    usedClasses,
    remainingClasses,
    purchaseDate,
    expiryDate,
    isDefault,
    status,
  } = userPackage;

  const progress = (usedClasses / totalClasses) * 100;

  const daysRemaining = Math.ceil(
    (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  const isExpiringSoon =
    daysRemaining <= 7 && daysRemaining > 0 && status === "active";

  return (
    <div
      className={`package-card ${isExpired ? "package-expired" : ""} ${isDefault ? "package-default" : ""}`}
    >
      {isDefault && <div className="badge-ribbon">Predeterminado</div>}

      <div className="package-header">
        <h3>{pkg.name}</h3>
        <span className={`badge badge-${status}`}>
          {status === "active" && "Activo"}
          {status === "expired" && "Expirado"}
          {status === "depleted" && "Agotado"}
        </span>
      </div>

      <div className="package-stats-detailed">
        <div className="stat-row">
          <span>Total de clases:</span>
          <strong>{totalClasses}</strong>
        </div>
        <div className="stat-row">
          <span>Clases usadas:</span>
          <strong>{usedClasses}</strong>
        </div>
        <div className="stat-row">
          <span>Clases restantes:</span>
          <strong className="text-primary">{remainingClasses}</strong>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">{Math.round(progress)}% usado</span>
      </div>

      <div className="package-dates">
        <div className="date-info">
          <span className="date-label">Fecha de compra:</span>
          <span>{new Date(purchaseDate).toLocaleDateString()}</span>
        </div>
        <div className="date-info">
          <span className="date-label">Vigencia:</span>
          <span className={isExpiringSoon ? "text-warning" : ""}>
            {new Date(expiryDate).toLocaleDateString()}
            {isExpiringSoon && ` (${daysRemaining} días)`}
          </span>
        </div>
      </div>

      {!isExpired && !isDefault && (
        <button
          className="btn btn-secondary btn-sm btn-block"
          onClick={() => onSetDefault(userPackage._id)}
        >
          Establecer como predeterminado
        </button>
      )}
    </div>
  );
};

export default MyPackages;
