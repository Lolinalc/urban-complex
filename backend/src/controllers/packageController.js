const Package = require("../models/Package");
const UserPackage = require("../models/UserPackage");
const Payment = require("../models/Payment");

// @desc    Obtener todos los paquetes disponibles
// @route   GET /api/packages
// @access  Public
exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener un paquete por ID
// @route   GET /api/packages/:id
// @access  Public
exports.getPackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: "Paquete no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: package,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Crear paquete (Admin)
// @route   POST /api/packages
// @access  Private/Admin
exports.createPackage = async (req, res) => {
  try {
    const package = await Package.create(req.body);

    res.status(201).json({
      success: true,
      data: package,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Actualizar paquete (Admin)
// @route   PUT /api/packages/:id
// @access  Private/Admin
exports.updatePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!package) {
      return res.status(404).json({
        success: false,
        message: "Paquete no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: package,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Eliminar paquete (Admin)
// @route   DELETE /api/packages/:id
// @access  Private/Admin
exports.deletePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndDelete(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: "Paquete no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Paquete eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Comprar paquete
// @route   POST /api/packages/:id/purchase
// @access  Private
exports.purchasePackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: "Paquete no encontrado",
      });
    }

    if (!package.isActive) {
      return res.status(400).json({
        success: false,
        message: "Este paquete no está disponible",
      });
    }

    // Calcular fecha de expiración
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + package.validityDays);

    // Crear el paquete del usuario
    const userPackage = await UserPackage.create({
      user: req.user._id,
      package: package._id,
      totalClasses: package.classCount || 999, // 999 para unlimited
      remainingClasses: package.classCount || 999,
      expiryDate,
      payment: req.body.paymentId,
    });

    // Si es el primer paquete del usuario, marcarlo como predeterminado
    const userPackagesCount = await UserPackage.countDocuments({
      user: req.user._id,
      status: "active",
    });

    if (userPackagesCount === 1) {
      userPackage.isDefault = true;
      await userPackage.save();
    }

    await userPackage.populate("package");

    res.status(201).json({
      success: true,
      data: userPackage,
      message: "Paquete comprado exitosamente",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener paquetes del usuario
// @route   GET /api/packages/my-packages
// @access  Private
exports.getMyPackages = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const userPackages = await UserPackage.find(filter)
      .populate("package")
      .populate("payment")
      .sort({ purchaseDate: -1 });

    res.status(200).json({
      success: true,
      count: userPackages.length,
      data: userPackages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener paquete activo/predeterminado del usuario
// @route   GET /api/packages/my-active-package
// @access  Private
exports.getMyActivePackage = async (req, res) => {
  try {
    // Buscar el paquete predeterminado activo
    let userPackage = await UserPackage.findOne({
      user: req.user._id,
      status: "active",
      isDefault: true,
    }).populate("package");

    // Si no hay paquete predeterminado, buscar cualquier paquete activo
    if (!userPackage) {
      userPackage = await UserPackage.findOne({
        user: req.user._id,
        status: "active",
      })
        .populate("package")
        .sort({ purchaseDate: -1 });
    }

    res.status(200).json({
      success: true,
      data: userPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Establecer paquete como predeterminado
// @route   PUT /api/packages/user-packages/:id/set-default
// @access  Private
exports.setDefaultPackage = async (req, res) => {
  try {
    const userPackage = await UserPackage.findById(req.params.id);

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: "Paquete no encontrado",
      });
    }

    // Verificar que el paquete pertenece al usuario
    if (userPackage.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    if (userPackage.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Solo puedes establecer paquetes activos como predeterminados",
      });
    }

    // Quitar el estado predeterminado de otros paquetes
    await UserPackage.updateMany(
      { user: req.user._id, _id: { $ne: userPackage._id } },
      { isDefault: false },
    );

    // Establecer este paquete como predeterminado
    userPackage.isDefault = true;
    await userPackage.save();

    res.status(200).json({
      success: true,
      data: userPackage,
      message: "Paquete establecido como predeterminado",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
