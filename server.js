require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// Initialize Razorpay SDK instance using environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Public Config Endpoint
 * Returns public KEY_ID to frontend without exposing KEY_SECRET
 */
app.get('/api/config', (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({ error: 'Razorpay KEY_ID not configured in .env' });
  }
  res.json({ key_id: process.env.RAZORPAY_KEY_ID });
});

/**
 * STEP 1: CREATE ORDER ENDPOINT
 * POST /api/create-order
 * Body: { amount (in rupees or paise), currency, receipt }
 */
app.post('/api/create-order', async (req, res) => {
  try {
    let { amount, currency, receipt } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    // Convert amount to integer paise (1 INR = 100 Paise)
    let amountInPaise = Math.round(Number(amount));
    
    // Handle case if frontend sent Rupees instead of Paise (e.g. 599 instead of 59900)
    if (amountInPaise < 100) {
      amountInPaise = Math.round(Number(amount) * 100);
    }

    // Minimum transaction amount check (100 paise = 1 INR)
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum order amount must be at least 100 paise (₹1.00)'
      });
    }

    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    
    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: 'Razorpay Authentication Failed: Invalid Key ID or Key Secret'
      });
    }

    return res.status(500).json({
      success: false,
      message: error.description || error.message || 'Failed to create Razorpay order'
    });
  }
});

/**
 * STEP 3: VERIFY SIGNATURE ENDPOINT
 * POST /api/verify-payment
 * Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 */
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters (payment_id, order_id, signature)'
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration: RAZORPAY_KEY_SECRET missing in .env'
      });
    }

    // Generate expected HMAC-SHA256 signature using order_id + "|" + payment_id
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Check string length compatibility before timingSafeEqual to avoid exception
    if (generated_signature.length !== razorpay_signature.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Signature mismatch.'
      });
    }

    // Secure timing-safe signature comparison
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(generated_signature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );

    if (isSignatureValid) {
      console.log(`Payment Verified Successfully! Payment ID: ${razorpay_payment_id}, Order ID: ${razorpay_order_id}`);
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      console.warn(`Payment Signature Mismatch for Order ID: ${razorpay_order_id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.'
      });
    }
  } catch (error) {
    console.error('Razorpay Payment Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during payment verification'
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`KAIRO Studio Server running live on http://localhost:${PORT}`);
  console.log(`Razorpay Gateway Active (Key ID: ${process.env.RAZORPAY_KEY_ID})`);
  console.log(`===================================================`);
});
