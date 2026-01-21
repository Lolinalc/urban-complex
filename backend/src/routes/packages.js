const express = require("express");
const router = express.Router();
const {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  purchasePackage,
  getMyPackages,
  getMyActivePackage,
  setDefaultPackage,
} = require("../controllers/packageController");
const { protect, adminOnly } = require("../middleware/auth");

// Rutas públicas
router.get("/", getPackages);
router.get("/:id", getPackage);

// Rutas de estudiante
router.post("/:id/purchase", protect, purchasePackage);
router.get("/my-packages/list", protect, getMyPackages);
router.get("/my-packages/active", protect, getMyActivePackage);
router.put("/user-packages/:id/set-default", protect, setDefaultPackage);

// Rutas de admin
router.post("/", protect, adminOnly, createPackage);
router.put("/:id", protect, adminOnly, updatePackage);
router.delete("/:id", protect, adminOnly, deletePackage);

module.exports = router;
