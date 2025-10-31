// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware untuk melindungi route (hanya untuk user yang login)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verifikasi access token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ambil data user tanpa password
      req.user = await User.findById(decoded.user.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User tidak ditemukan" });
      }

      next();
    } catch (error) {
      // Cek apakah error karena token kadaluarsa
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token kadaluarsa" });
      }

      console.error("Verifikasi token gagal:", error);
      return res.status(401).json({ message: "Token tidak valid" });
    }
  } else {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }
};

// Middleware untuk membatasi akses hanya untuk admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ message: "Akses ditolak: hanya admin yang boleh" });
  }
};

module.exports = { protect, admin };
