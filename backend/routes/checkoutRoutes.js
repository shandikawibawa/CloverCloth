const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/checkout
 * @desc    Create a new checkout session
 * @access  Private
 */
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }

  try {
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });

    console.log(`✅ Checkout created for user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("❌ Error Creating checkout session:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @route   PUT /api/checkout/:id/pay
 * @desc    Update checkout to mark as paid
 * @access  Private
 */
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();

      await checkout.save();

      console.log(`✅ Checkout marked as paid: ${checkout._id}`);
      res.status(200).json(checkout);
    } else {
      res.status(400).json({ message: "Invalid Payment Status" });
    }
  } catch (error) {
    console.error("❌ Error updating payment:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @route   POST /api/checkout/:id/finalize
 * @desc    Finalize checkout and convert to an order after payment confirmation
 * @access  Private
 */
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (checkout.isPaid && !checkout.isFinalized) {
      // 🔍 Populate each item with Product details
      const populatedItems = await Promise.all(
        checkout.checkoutItems.map(async (item) => {
          const product = await Product.findById(item.productId);

          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          return {
            product: product._id, // ✅ fixed field name
            name: product.name,
            image: product.images?.[0]?.url || "",
            price: product.price,
            quantity: item.quantity, // ✅ match Order schema
            size: item.size || "",
            color: item.color || "",
          };
        })
      );

      // ✅ Create final order
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: populatedItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      });

      // Mark checkout as finalized
      checkout.isFinalized = true;
      checkout.finalizeAt = Date.now();
      await checkout.save();

      // 🧹 Clear user cart
      await Cart.findOneAndDelete({ user: checkout.user });

      console.log(`✅ Order finalized for user: ${checkout.user}`);
      res.status(201).json(finalOrder);
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error("❌ Error finalizing checkout:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
