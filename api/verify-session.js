import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing session ID" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      return res.status(200).json({
        success: true,
        customerEmail: session.customer_email,
        total: session.amount_total / 100,
        shipping: session.metadata,
        items: JSON.parse(session.metadata.items)
      });
    } else {
      return res.status(400).json({ success: false, message: "Tribute not yet received." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}