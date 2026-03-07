/**
 * Contacts our Vercel Serverless API to request a real Stripe session
 */
export const startPaymentQuest = async (items: any[], email: string, shipping: any) => {
  try {
    // UPDATED: We now call the relative path /api/... 
    // This works both locally and on Vercel automatically!
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customerEmail: email, shippingInfo: shipping }),
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "The Imperial Mint rejected the request.");
    }
  } catch (error: any) {
    console.error("Payment Quest Failed:", error);
    throw error;
  }
};

/**
 * Asks the Vercel API to verify the Stripe session ID
 */
export const verifyStripeTribute = async (sessionId: string) => {
  // UPDATED: Path changed to /api/verify-session
  const response = await fetch(`/api/verify-session?sessionId=${sessionId}`);
  if (!response.ok) throw new Error("The scroll of verification is invalid.");
  return await response.json();
};