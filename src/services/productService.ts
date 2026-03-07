import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc } from "firebase/firestore"; // Added updateDoc
import { db } from "../firebase";
import { Product } from "../types";

const productsCollection = collection(db, "products");

export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error("The merchant lost his inventory keys:", error);
    throw error;
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Add a new artifact to the ledger
export const createProduct = async (productData: Omit<Product, 'id'>) => {
  try {
    await addDoc(productsCollection, productData);
  } catch (error) {
    console.error("Could not forge the artifact:", error);
    throw error;
  }
};

// NEW: Update the quantity of an existing artifact
export const updateProductStock = async (productId: string, newQuantity: number) => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      stock_quantity: newQuantity
    });
  } catch (error) {
    console.error("The ledger failed to update stock:", error);
    throw error;
  }
};

// Remove an artifact from the shelf
export const banishProduct = async (productId: string) => {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("The artifact is cursed and cannot be removed:", error);
    throw error;
  }
};