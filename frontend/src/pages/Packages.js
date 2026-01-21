import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { packageService } from "../services/api";
import "../assets/styles/Packages.css";

const Packages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getAll();
      setPackages(response.data.data);
    } catch (error) {
      console.error("Error al cargar paquetes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg) => {
    navigate(`/packages/purchase/${pkg._id}`);
  };

  const getExpirationText = (validityDays) => {
    if (validityDays === 3) return "Expira en 3 Días";
    if (validityDays === 30) return "Expira en 1 Mes";
    if (validityDays === 45) return "Expira en 45 Días";
    if (validityDays === 60) return "Expira en 2 Meses";
    return `Expira en ${validityDays} días`;
  };

  const getClassesText = (totalClasses) => {
    if (totalClasses === 1) return "CLASE";
    return "CLASES";
  };

  const hasDiscount = (pkg) => {
    return pkg.discountPercentage && pkg.discountPercentage > 0;
  };

  const getOriginalPrice = (pkg) => {
    if (hasDiscount(pkg)) {
      return (pkg.price / (1 - pkg.discountPercentage / 100)).toFixed(2);
    }
    return pkg.price;
  };

  if (loading) {
    return (
      <div className="packages-page">
        <div className="loading">Cargando paquetes...</div>
      </div>
    );
  }

  return (
    <div className="packages-page">
      <div className="packages-container">
        <div className="packages-header">
          <h1>POR CLASES</h1>
          <div className="packages-info">
            <p className="info-title">COSTOS:</p>
            <p>CLASE SUELTA $100</p>
            <p>PAQUETE 1: UNA DISCIPLINA / 8 CLASES $550 – 8 clases</p>
            <p>PAQUETE 2: DOS DISCIPLINAS/ 16 CLASES $850</p>
            <p>PAQUETE 3: TRES DISCIPLINAS/ 24 CLASES $1000</p>
            <p>PAQUETE 4: CUATRO DISCIPLINAS/ 32 CLASES $1100</p>
            <p className="info-highlight">
              PAQUETE ALTO RENDIMIENTO $950 SOLO PARA ALUMNAS QUE DESEEN COMPETIR SE
              DEBE TOMAR TODAS LAS CLASES DEL NIVEL.
            </p>
          </div>
        </div>

        <div className="packages-grid">
          {packages.map((pkg) => (
            <div key={pkg._id} className="package-card">
              <div className="package-header">
                <h2 className="package-classes">
                  {pkg.totalClasses}
                </h2>
                <p className="package-classes-label">
                  {getClassesText(pkg.totalClasses)}
                </p>
              </div>

              <div className="package-body">
                {hasDiscount(pkg) && (
                  <div className="package-discount">
                    <span className="discount-badge">
                      {pkg.discountPercentage}% OFF
                    </span>
                    <span className="original-price">
                      ${getOriginalPrice(pkg)}
                    </span>
                  </div>
                )}

                <div className="package-price">
                  ${pkg.price.toFixed(2)}
                </div>

                <p className="package-access">
                  Acceso a {pkg.totalClasses} clase{pkg.totalClasses > 1 ? "s" : ""}
                </p>

                <p className="package-expiration">
                  {getExpirationText(pkg.validityDays)}
                </p>

                <button
                  className="package-details-link"
                  onClick={() => {
                    const detailsSection = document.getElementById(`details-${pkg._id}`);
                    if (detailsSection) {
                      detailsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Ver detalles
                </button>

                <button
                  className="package-buy-btn"
                  onClick={() => handleSelectPackage(pkg)}
                >
                  Comprar
                </button>
              </div>

              {/* Detalles ocultos para scroll */}
              <div id={`details-${pkg._id}`} className="package-details-hidden">
                <h3>{pkg.name}</h3>
                <p>{pkg.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Packages;
