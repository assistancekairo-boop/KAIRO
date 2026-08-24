const crypto = require('crypto');

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
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body || {};
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'BPIA3baRFTGsZzNsgd2be0W3';

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({ success: true, message: 'Payment verified' });
    } else {
      return res.status(400).json({ success: false, message: 'Signature mismatch' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
