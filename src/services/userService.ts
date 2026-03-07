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
  cart?: any[]; // NEW: The Sack lives in the Dossier
}

export const createUserDossier = async (profile: UserProfile) => {
  try {
    const userRef = doc(db, "users", profile.uid);
    await setDoc(userRef, {
      ...profile,
      cart: [], // Initialize empty sack
      created_at: new Date()
    });
  } catch (error) {
    console.error("Dossier creation failed:", error);
  }
};

export const getUserDossier = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

// NEW: Scribe the current sack contents into the database
export const saveCartToVault = async (uid: string, cart: any[]) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { cart: cart });
  } catch (error) {
    console.error("Failed to secure the sack in the vault:", error);
  }
};

const usersCollection = collection(db, "users");


// NEW: Fetch every registered Knight
export const getAllCitizens = async (): Promise<User[]> => {
  const q = query(usersCollection, orderBy("display_name", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    username: doc.data().display_name,
    role: doc.data().role,
    isBanned: doc.data().isBanned || false
  } as User));
};

// NEW: Toggle a Knight's status
export const toggleBanStatus = async (uid: string, currentStatus: boolean) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { isBanned: !currentStatus });
};

export const updateUserDossier = async (uid: string, data: any) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};