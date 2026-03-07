import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

const CLIENT_URL = process.env.CLIENT_URL;

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, customerEmail, shippingInfo } = req.body;

    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd', 
        product_data: {
          name: item.name,
          images: [item.image.startsWith('http') ? item.image : 'https://placehold.co/600x400?text=Artifact'],
          description: `Legendary artifact for ${customerEmail}`,
        },
        unit_amount: item.price * 100, 
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        address: shippingInfo.address,
        city: shippingInfo.city,
        zip: shippingInfo.zip,
        items: JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity, name: i.name, price: i.price, image: i.image })))
      },
      // FIXED: Moved session_id to AFTER the hash so HashRouter can see it
      success_url: `${CLIENT_URL}/#/inventory?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/#/checkout`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/verify-session/:sessionId', async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
      if (session.payment_status === 'paid') {
        res.json({
          success: true,
          customerEmail: session.customer_email,
          total: session.amount_total / 100,
          shipping: session.metadata,
          items: JSON.parse(session.metadata.items)
        });
      } else {
        res.status(400).json({ success: false, message: "Tribute not yet received." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`------------------------------------------`);
  console.log(`THE ROYAL LEDGER (BACKEND) IS OPEN`);
  console.log(`Port: ${PORT}`);
  console.log(`Redirecting back to: ${CLIENT_URL}`);
  console.log(`------------------------------------------`);
});