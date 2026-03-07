import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { items, customerEmail, shippingInfo } = req.body;

    // Use VERCEL_URL if available, otherwise fallback to local for testing
    // Vercel automatically provides the domain via an environment variable
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const domain = `${protocol}://${host}`;

    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd', 
        product_data: {
          name: item.name,
          images: [item.image.startsWith('http') ? item.image : 'https://placehold.co/600x400?text=Artifact'],
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
      // DYNAMIC URL: This automatically points to your Vercel domain!
      success_url: `${domain}/#/inventory?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/#/checkout`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}