const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Por favor ingresa el nombre del paquete"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["clases", "mensual", "unlimited"],
      required: true,
    },
    classCount: {
      type: Number,
      required: function () {
        return this.type === "clases";
      },
    },
    price: {
      type: Number,
      required: [true, "Por favor ingresa el precio del paquete"],
    },
    validityDays: {
      type: Number,
      required: [true, "Por favor ingresa la vigencia en días"],
      default: 30,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    features: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Package", packageSchema);
