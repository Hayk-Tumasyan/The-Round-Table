import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Tournament } from "../types";

const tournamentsCollection = collection(db, "tournaments");

export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const q = query(tournamentsCollection, orderBy("event_date", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      let formattedDate = "TBD";
      if (data.event_date) {
        formattedDate = data.event_date.toDate().toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        });
      }

      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        date: formattedDate,
        location: data.location_name || "Unknown Realm",
        prize: data.prize,
        status: data.status,
        external_link: data.external_link || "" // NEW: Captured from Firestore
      } as any; 
    });
  } catch (error) {
    console.error("The herald failed:", error);
    throw error;
  }
};

export const createTournament = async (data: any) => {
  try {
    await addDoc(tournamentsCollection, {
      ...data,
      event_date: Timestamp.fromDate(new Date(data.event_date)),
      external_link: data.external_link || "" // NEW: Saved to Firestore
    });
  } catch (error) {
    throw error;
  }
};

export const banishTournament = async (id: string) => {
  const tournamentRef = doc(db, "tournaments", id);
  await deleteDoc(tournamentRef);
};