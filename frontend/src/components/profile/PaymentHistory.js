import React, { useState, useEffect } from "react";
import { paymentService } from "../../services/api";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getMyPayments();
      setPayments(response.data.data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPaid = () => {
    return payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  if (loading) return <div className="loading">Cargando pagos...</div>;

  return (
    <div className="payment-history">
      <h1>Historial de Pagos</h1>

      {/* Total Paid */}
      <div className="total-paid-card">
        <span className="total-label">Total pagado:</span>
        <span className="total-amount">${getTotalPaid().toFixed(2)}</span>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="empty-state">
          <p>No hay pagos registrados</p>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map((payment) => (
            <PaymentCard key={payment._id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
};

const PaymentCard = ({ payment }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      card: "Tarjeta",
      cash: "Efectivo",
      transfer: "Transferencia",
      other: "Otro",
    };
    return labels[method] || method;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendiente",
      completed: "Completado",
      failed: "Fallido",
      refunded: "Reembolsado",
    };
    return labels[status] || status;
  };

  return (
    <div className="payment-card">
      <div className="payment-header">
        <div className="payment-date">{formatDate(payment.createdAt)}</div>
        <span className={`badge badge-${payment.status}`}>
          {getStatusLabel(payment.status)}
        </span>
      </div>

      <div className="payment-details">
        <div className="payment-amount">${payment.amount.toFixed(2)}</div>

        <div className="payment-info">
          <p className="payment-description">
            {payment.description || "Pago de clases"}
          </p>
          <p className="payment-method">
            Método: {getPaymentMethodLabel(payment.paymentMethod)}
          </p>
        </div>
      </div>

      {payment.bookings && payment.bookings.length > 0 && (
        <div className="payment-bookings">
          <p className="bookings-count">
            {payment.bookings.length} clase
            {payment.bookings.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {payment.invoice && payment.invoice.url && (
        <a
          href={payment.invoice.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-secondary"
        >
          Ver recibo
        </a>
      )}
    </div>
  );
};

export default PaymentHistory;
