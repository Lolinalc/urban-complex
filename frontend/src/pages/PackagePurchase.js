import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { packageService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "../assets/styles/PackagePurchase.css";

// Inicializar Stripe - IMPORTANTE: Reemplaza con tu clave pública de Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_YOUR_KEY");

const PackagePurchase = () => {
  const { id } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackageDetails();
  }, [id]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await packageService.getById(id);
      setPackageData(response.data.data);
    } catch (error) {
      console.error("Error al cargar paquete:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="purchase-page">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="purchase-page">
        <div className="error">Paquete no encontrado</div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PurchaseForm packageData={packageData} />
    </Elements>
  );
};

const PurchaseForm = ({ packageData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");

  const getExpirationText = (validityDays) => {
    if (validityDays === 3) return "Expira en 3 Días";
    if (validityDays === 30) return "Expira en 1 Mes";
    if (validityDays === 45) return "Expira en 45 Días";
    if (validityDays === 60) return "Expira en 2 Meses";
    return `Expira en ${validityDays} días`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Crear payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Aquí deberías llamar a tu backend para procesar el pago
      // const response = await packageService.purchase({
      //   packageId: packageData._id,
      //   paymentMethodId: paymentMethod.id,
      //   discountCode: discountCode,
      //   giftCardCode: giftCardCode,
      // });

      // Simulación de compra exitosa
      console.log("Payment method created:", paymentMethod);

      // Redirigir al perfil después de la compra
      alert("¡Compra exitosa! Tu paquete ha sido activado.");
      navigate("/profile");

    } catch (err) {
      console.error("Error en el pago:", err);
      setError("Error al procesar el pago. Por favor intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <div className="purchase-page">
      <div className="purchase-container">
        <h1>Orden de compra</h1>

        <button className="back-button" onClick={() => navigate("/packages")}>
          ← Selecciona otro paquete
        </button>

        <div className="purchase-layout">
          {/* Columna izquierda - Detalles del paquete */}
          <div className="purchase-left">
            <h2 className="package-title">
              {packageData.totalClasses} CLASE{packageData.totalClasses > 1 ? "S" : ""}
            </h2>

            {/* Detalles del paquete */}
            <div className="collapsible-section">
              <button
                className="section-header"
                onClick={() => setShowDetails(!showDetails)}
              >
                <span>Detalles del paquete</span>
                <span className="arrow">{showDetails ? "▲" : "▼"}</span>
              </button>
              {showDetails && (
                <div className="section-content">
                  <p>{getExpirationText(packageData.validityDays)}</p>
                  <p>Acceso a {packageData.totalClasses} clase{packageData.totalClasses > 1 ? "s" : ""}</p>
                </div>
              )}
            </div>

            {/* Código de descuento */}
            <div className="collapsible-section">
              <button
                className="section-header"
                onClick={() => setShowDiscount(!showDiscount)}
              >
                <span>Código de descuento</span>
                <span className="arrow">{showDiscount ? "▲" : "▼"}</span>
              </button>
              {showDiscount && (
                <div className="section-content">
                  <input
                    type="text"
                    placeholder="Ingresa tu código"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="code-input"
                  />
                  <button className="apply-button">Aplicar</button>
                </div>
              )}
            </div>

            {/* Tarjeta de regalo */}
            <div className="collapsible-section">
              <button
                className="section-header"
                onClick={() => setShowGiftCard(!showGiftCard)}
              >
                <span>Tarjeta de regalo</span>
                <span className="arrow">{showGiftCard ? "▲" : "▼"}</span>
              </button>
              {showGiftCard && (
                <div className="section-content">
                  <input
                    type="text"
                    placeholder="Ingresa tu código"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    className="code-input"
                  />
                  <button className="apply-button">Aplicar</button>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="purchase-summary">
              <div className="summary-row">
                <span>Pago de</span>
                <span>${packageData.price.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${packageData.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario de pago */}
          <div className="purchase-right">
            <div className="payment-header">
              <h3>
                {packageData.totalClasses} CLASE{packageData.totalClasses > 1 ? "S" : ""}
              </h3>
              <p className="payment-amount">MXN {packageData.price.toFixed(2)}</p>
            </div>

            {/* Botón de Link (opcional) */}
            <div className="payment-method-link">
              <button className="link-button">
                <img src="/link-logo.png" alt="Link" className="link-logo" />
                <span>0669</span>
              </button>
            </div>

            <div className="payment-divider">
              <span>O BIEN</span>
            </div>

            {/* Formulario de pago */}
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="form-input"
                />
              </div>

              <div className="payment-method-section">
                <h4>Método de pago</h4>
                <div className="card-info-label">Información de la tarjeta</div>

                <div className="card-element-container">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              <div className="form-group">
                <label>Nombre del titular de tarjeta</label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>País o región</label>
                <select className="form-input" defaultValue="MX">
                  <option value="MX">México</option>
                  <option value="US">Estados Unidos</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <input type="checkbox" id="save-data" />
                <label htmlFor="save-data">
                  Guardar mis datos para un proceso de compra más rápido
                  <p className="checkbox-description">
                    Paga de forma segura en UPPER HIT y en todos los comercios que acepten Link.
                  </p>
                </label>
              </div>

              {error && <div className="payment-error">{error}</div>}

              <button
                type="submit"
                className="pay-button"
                disabled={!stripe || processing}
              >
                {processing ? "Procesando..." : "Pagar"}
              </button>

              <div className="payment-footer">
                <span>Powered by</span>
                <span className="stripe-logo">stripe</span>
                <a href="#">Condiciones</a>
                <a href="#">Privacidad</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagePurchase;
