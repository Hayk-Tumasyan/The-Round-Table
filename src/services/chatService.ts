import { 
  collection, addDoc, serverTimestamp, query, 
  orderBy, onSnapshot, doc, setDoc, deleteDoc, getDocs
} from "firebase/firestore";
import { db } from "../firebase";

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
}

// 1. Send message logic (Works for both Admin and User)
export const sendMessage = async (chatRoomId: string, senderId: string, senderName: string, text: string) => {
  const chatRef = doc(db, "chats", chatRoomId);
  const messagesRef = collection(db, "chats", chatRoomId, "messages");

  // Add the message to the subcollection
  await addDoc(messagesRef, {
    senderId,
    senderName,
    text,
    timestamp: serverTimestamp()
  });

  // Update the parent document with metadata for the Admin list
  await setDoc(chatRef, {
    lastMessage: text,
    lastUpdated: serverTimestamp(),
    userName: chatRoomId === senderId ? senderName : "The King", 
    userId: chatRoomId
  }, { merge: true });
};

// 2. Real-time message listener
export const listenToChat = (chatRoomId: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, "chats", chatRoomId, "messages"),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};

/**
 * 3. NEW: Permanently close and delete a chat room
 * Note: We delete the parent document. In a high-scale app, we would 
 * also delete sub-collection docs, but for the Citadel, deleting the 
 * parent doc hides the chat from all UI lists instantly.
 */
export const deleteChatRoom = async (chatRoomId: string) => {
  try {
    // First, we need to clear out the messages sub-collection 
    // to prevent orphaned data in the database.
    const messagesRef = collection(db, "chats", chatRoomId, "messages");
    const snapshot = await getDocs(messagesRef);
    
    // Create an array of delete promises
    const deletePromises = snapshot.docs.map(mDoc => deleteDoc(mDoc.ref));
    await Promise.all(deletePromises);

    // Finally, delete the main room document
    const chatRef = doc(db, "chats", chatRoomId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error("The raven failed to burn the scroll:", error);
    throw error;
  }
};