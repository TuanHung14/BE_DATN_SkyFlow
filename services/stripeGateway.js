const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Thêm vào .env

exports.createStripePayment = async ({ orderId, amount }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // số tiền đơn vị là cent (100 = 1 USD)
      currency: "vnd", // hoặc "vnd" nếu hỗ trợ
      metadata: { order_id: orderId },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error(" Stripe Error:", error);
    throw error;
  }
};
