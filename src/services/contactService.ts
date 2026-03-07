import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const contactsCollection = collection(db, "contacts");

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'answered';
  date?: string;
}

export const sendToKing = async (data: Omit<ContactMessage, 'id' | 'status'>) => {
  try {
    await addDoc(contactsCollection, {
      ...data,
      status: 'unread',
      created_at: serverTimestamp()
    });
  } catch (error) {
    console.error("The raven was intercepted:", error);
    throw error;
  }
};

// NEW: Fetch all ravens for the Hand of the King
export const getContacts = async (): Promise<ContactMessage[]> => {
  try {
    const q = query(contactsCollection, orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.created_at?.toDate().toLocaleString() || "Ancient Date"
      } as ContactMessage;
    });
  } catch (error) {
    console.error("Could not open the birdcage:", error);
    return [];
  }
};

// NEW: Mark a raven as answered
export const markAsAnswered = async (id: string) => {
  const docRef = doc(db, "contacts", id);
  await updateDoc(docRef, { status: 'answered' });
};

// NEW: Remove a raven forever
export const banishContact = async (id: string) => {
  const docRef = doc(db, "contacts", id);
  await deleteDoc(docRef);
};