import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getUserOrders, createOrder } from '../services/orderService';
import { verifyStripeTribute } from '../services/paymentService';
import { OrderData } from "../types";
import { Scroll, Package, Clock, Truck, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  const processSuccessfulPayment = async (sid: string) => {
    if (!user) return;
    setProcessingPayment(true);
    try {
      const sessionData = await verifyStripeTribute(sid);

      await createOrder({
        userId: user.id,
        customerName: user.username,
        items: sessionData.items,
        totalGold: sessionData.total,
        status: 'Pending',
        shippingAddress: sessionData.shipping.address,
        city: sessionData.shipping.city,
        postalCode: sessionData.shipping.zip
      });

      clearCart();
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSearchParams({});
      const freshOrders = await getUserOrders(user.id);
      setOrders(freshOrders);
      
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError("The verification raven failed. Check thy bank or contact the King.");
    } finally {
      setProcessingPayment(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!user) return;

      if (sessionId) {
        await processSuccessfulPayment(sessionId);
      } else {
        try {
          const data = await getUserOrders(user.id);
          setOrders(data);
        } catch (err) {
          setError("The ledger index is still being forged.");
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [user, sessionId]);

  if (loading || processingPayment) {
    return (
      <div className="p-40 text-center flex flex-col items-center gap-6">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-amber-500 medieval-font animate-pulse uppercase tracking-widest text-sm">
          {processingPayment ? t('inventory.verifying') : t('common.loading')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <Link to="/profile" className="flex items-center gap-2 text-zinc-600 hover:text-amber-500 transition-colors uppercase text-[10px] font-bold tracking-widest mb-12">
        <ChevronLeft className="w-4 h-4" />
        {t('inventory.return_profile')}
      </Link>

      <div className="mb-12 border-b border-zinc-900 pb-8">
        <span className="text-red-700 font-bold uppercase text-[10px] tracking-[0.3em] block mb-2">{t('inventory.subtitle')}</span>
        <h1 className="text-5xl font-bold medieval-font text-zinc-100 uppercase">{t('inventory.title')}</h1>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 text-red-500 text-xs font-bold uppercase rounded flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-[#1c120d] border border-dashed border-zinc-800 rounded-xl">
          <Scroll className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
          <p className="text-zinc-600 italic">{t('inventory.empty_msg')}</p>
          <Link to="/shop" className="mt-8 inline-block text-amber-500 text-xs uppercase font-bold underline">{t('inventory.visit_shop')}</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#1c120d] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl hover:border-zinc-700 transition-all">
              <div className="p-6 bg-[#160f0c] border-b border-zinc-900 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <Package className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{t('inventory.order_id')}</p>
                    <p className="text-zinc-300 font-mono text-xs">{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{t('inventory.gold_spent')}</p>
                    <p className="text-amber-500 font-bold medieval-font">{order.totalGold}g</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                    order.status === 'Delivered' ? 'bg-green-900/20 text-green-500 border border-green-900/30' :
                    'bg-amber-900/20 text-amber-500 border border-amber-900/30'
                  }`}>
                    {order.status === 'Pending' ? <Clock className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                    {t(`inventory.status.${order.status}`)}
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-[#0f0a08] rounded border border-zinc-900">
                    <img src={item.image} alt="" className="w-10 h-10 object-cover rounded grayscale" />
                    <div>
                      <p className="text-zinc-200 text-sm font-bold uppercase tracking-wide">{item.name}</p>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{t('checkout.qty')}: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;