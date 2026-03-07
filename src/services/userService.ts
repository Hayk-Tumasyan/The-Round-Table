import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "../types";

export interface UserProfile {
  uid: string;
  display_name: string;
  role: 'user' | 'admin';
  bio: string;
  preferred_lang: string;
  avatar_url: string;
  isBanned: boolean;
  cart?: any[]; // The Sack contents stored in the cloud
}

/**
 * Creates a new dossier for a Knight entering the realm
 */
export const createUserDossier = async (profile: UserProfile) => {
  try {
    const userRef = doc(db, "users", profile.uid);
    await setDoc(userRef, {
      ...profile,
      cart: profile.cart || [], 
      created_at: new Date()
    });
  } catch (error) {
    console.error("Dossier creation failed:", error);
  }
};

/**
 * Retrieves a Knight's profile and saved sack
 */
export const getUserDossier = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Failed to retrieve dossier:", error);
    return null;
  }
};

/**
 * Scribes the current sack contents into the database vault
 */
export const saveCartToVault = async (uid: string, cart: any[]) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { cart: cart });
  } catch (error) {
    console.error("Failed to secure the sack in the vault:", error);
  }
};

const usersCollection = collection(db, "users");

/**
 * Fetch every registered citizen of the realm
 */
export const getAllCitizens = async (): Promise<User[]> => {
  try {
    const q = query(usersCollection, orderBy("display_name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      username: doc.data().display_name,
      email: doc.data().email || "",
      role: doc.data().role,
      isBanned: doc.data().isBanned || false
    } as User));
  } catch (error) {
    console.error("Failed to fetch citizens:", error);
    return [];
  }
};

/**
 * Toggle a Knight's status (Banish/Restore)
 */
export const toggleBanStatus = async (uid: string, currentStatus: boolean) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { isBanned: !currentStatus });
  } catch (error) {
    console.error("Banishment failed:", error);
  }
};

/**
 * Update general dossier information
 */
export const updateUserDossier = async (uid: string, data: any) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Failed to update dossier:", error);
  }
};