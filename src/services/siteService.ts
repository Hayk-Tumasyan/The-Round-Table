import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface AboutPageData {
  imageUrl: string;
  establishedDate: string;
}

// Fetch the metadata for the About Page
export const getAboutPageData = async (): Promise<AboutPageData | null> => {
  try {
    const docRef = doc(db, "site_metadata", "about_page");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as AboutPageData;
    }
    return null;
  } catch (error) {
    console.error("The records for the About page are missing:", error);
    return null;
  }
};