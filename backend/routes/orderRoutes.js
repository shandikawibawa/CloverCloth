const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post("/", protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Isi data orderItems dari product database
    const populatedItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        return {
          product: product._id, // ✅ disimpan sebagai "product"
          name: product.name,
          image: product.images?.[0]?.url || product.images || "",
          price: product.price,
          quantity: item.quantity || 1,
          size: item.size || "",
          color: item.color || "",
        };
      })
    );

    const order = new Order({
      user: req.user._id,
      orderItems: populatedItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get logged-in user's orders
 * @access  Private
 */
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: "orderItems.product", // ✅ ubah dari productId → product
        select: "name images",
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details by ID
 * @access  Private
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "orderItems.product", // ✅ ubah juga di sini
        select: "name images",
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
