import { 
  collection, addDoc, serverTimestamp, query, where, 
  orderBy, getDocs, doc, updateDoc, runTransaction 
} from "firebase/firestore";
import { db } from "../firebase";
import { OrderData } from "../types";

const ordersCollection = collection(db, "orders");

export const createOrder = async (orderData: OrderData) => {
  try {
    // We use a Transaction to ensure stock reduction and order creation happen together
    return await runTransaction(db, async (transaction) => {
      
      // 1. Check all items for stock availability first
      const productUpdates = [];

      for (const item of orderData.items) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`The artifact ${item.name} has vanished from existence!`);
        }

        const currentStock = productSnap.data().stock_quantity || 0;
        
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Only ${currentStock} remaining.`);
        }

        // Prepare the update logic
        productUpdates.push({
          ref: productRef,
          newStock: currentStock - item.quantity
        });
      }

      // 2. If we reach here, all items are in stock. Perform the updates.
      productUpdates.forEach(update => {
        transaction.update(update.ref, { stock_quantity: update.newStock });
      });

      // 3. Create the order document reference
      const newOrderRef = doc(collection(db, "orders"));
      
      // 4. Set the order data in the transaction
      transaction.set(newOrderRef, {
        ...orderData,
        created_at: serverTimestamp(),
      });

      return newOrderRef.id; // Return the ID to the UI
    });
  } catch (error: any) {
    console.error("The transaction failed:", error);
    throw error; // Pass the specific error back to the UI
  }
};

export const getUserOrders = async (userId: string): Promise<OrderData[]> => {
  try {
    const q = query(ordersCollection, where("userId", "==", userId), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data, date: data.created_at?.toDate().toLocaleDateString() || "Ancient Date" } as OrderData;
    });
  } catch (error) {
    return [];
  }
};

export const getAllOrders = async (): Promise<OrderData[]> => {
  try {
    const q = query(ordersCollection, orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data, date: data.created_at?.toDate().toLocaleDateString() || "Ancient Date" } as OrderData;
    });
  } catch (error) {
    console.error("Failed to read all ledgers:", error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status: newStatus });
};