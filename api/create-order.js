const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_TTfqyRkXrGvP3b',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'BPIA3baRFTGsZzNsgd2be0W3'
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    let { amount, currency, receipt } = req.body || {};
    let amountInPaise = Math.round(Number(amount) || 59900);
    if (amountInPaise < 100) amountInPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`
    });

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_TTfqyRkXrGvP3b'
    });
  } catch (err) {
    console.error('Vercel create-order error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Order creation failed' });
  }
};
