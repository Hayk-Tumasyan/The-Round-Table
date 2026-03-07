/**
 * Contacts our local backend to request a real Stripe session
 */
export const startPaymentQuest = async (items: any[], email: string, shipping: any) => {
  try {
    const response = await fetch('http://localhost:4000/create-checkout-session', {
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
 * NEW: Asks the backend to verify the Stripe session ID
 */
export const verifyStripeTribute = async (sessionId: string) => {
  const response = await fetch(`http://localhost:4000/verify-session/${sessionId}`);
  if (!response.ok) throw new Error("The scroll of verification is invalid.");
  return await response.json();
};