const mongoose = require("mongoose");

const userPackageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    totalClasses: {
      type: Number,
      required: true,
    },
    usedClasses: {
      type: Number,
      default: 0,
    },
    remainingClasses: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "depleted"],
      default: "active",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Índice para búsquedas rápidas
userPackageSchema.index({ user: 1, status: 1 });
userPackageSchema.index({ expiryDate: 1 });

// Método para usar una clase del paquete
userPackageSchema.methods.useClass = async function () {
  if (this.remainingClasses <= 0) {
    throw new Error("No hay clases disponibles en este paquete");
  }

  if (this.status === "expired") {
    throw new Error("Este paquete ha expirado");
  }

  this.usedClasses += 1;
  this.remainingClasses -= 1;

  if (this.remainingClasses === 0) {
    this.status = "depleted";
  }

  await this.save();
};

// Middleware para actualizar estado basado en fecha de expiración
userPackageSchema.pre("save", function (next) {
  if (this.expiryDate < new Date() && this.status === "active") {
    this.status = "expired";
  }
  next();
});

module.exports = mongoose.model("UserPackage", userPackageSchema);
