import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import { sendStatusEmail } from '../utils/sendEmail.js';
import { sendWhatsAppNotification } from '../utils/sendWhatsApp.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create Razorpay Order
// @route   POST /api/orders/razorpay
// @access  Public (for now)
router.post('/razorpay', async (req, res) => {
  try {
    const { amount } = req.body; 

    if (!amount || amount === 0) {
       return res.status(400).json({ message: 'Invalid amount' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `rcpt_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await instance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ message: error.message || 'Something went wrong with Razorpay' });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      user
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        userDetails: user,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();
      
      // Fire async status email & whatsapp for 'Placed'
      sendStatusEmail(createdOrder).catch(console.error);
      sendWhatsAppNotification(createdOrder).catch(console.error);
      
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.orderStatus = 'Delivered';
      order.statusHistory.push({ status: 'Delivered', timestamp: Date.now() });

      const updatedOrder = await order.save();
      sendStatusEmail(updatedOrder).catch(console.error);
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order status timeline and details
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', async (req, res) => {
  try {
    const { orderStatus, trackingId, courierCompany, estimatedDeliveryDate } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      if (orderStatus) {
        order.orderStatus = orderStatus;
        order.statusHistory.push({ status: orderStatus, timestamp: Date.now() });
      }
      
      // Update fulfillment details if provided
      if (trackingId !== undefined) order.trackingId = trackingId;
      if (courierCompany !== undefined) order.courierCompany = courierCompany;
      if (estimatedDeliveryDate !== undefined) order.estimatedDeliveryDate = estimatedDeliveryDate;

      // Sync legacy boolean states for backwards compatibility
      if (orderStatus === 'Delivered') {
        order.isDelivered = true;
        if (!order.deliveredAt) order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      
      // Trigger automated notifications when status changes
      sendStatusEmail(updatedOrder).catch(console.error);
      sendWhatsAppNotification(updatedOrder).catch(console.error);

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
