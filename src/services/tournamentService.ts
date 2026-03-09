import { collection, getDocs, getDoc, query, orderBy, addDoc, deleteDoc, doc, Timestamp, setDoc } from "firebase/firestore";
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

export const getTournamentById = async (id: string): Promise<Tournament | null> => {
  try {
    const tournamentRef = doc(db, "tournaments", id);
    const docSnap = await getDoc(tournamentRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      let formattedDate = "TBD";
      if (data.event_date) {
        formattedDate = data.event_date.toDate().toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        });
      }

      return {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        date: formattedDate,
        location: data.location_name || "Unknown Realm",
        prize: data.prize,
        status: data.status,
        external_link: data.external_link || ""
      } as any;
    }
    return null;
  } catch (error) {
    console.error("The herald could not find this tournament:", error);
    throw error;
  }
};

export const joinTournament = async (tournamentId: string, userId: string, username: string) => {
  try {
    const participantRef = doc(db, "tournaments", tournamentId, "participants", userId);
    await setDoc(participantRef, {
      userId,
      username,
      joinedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Failed to register for the tournament:", error);
    throw error;
  }
};

export const getTournamentParticipants = async (tournamentId: string) => {
  try {
    const participantsRef = collection(db, "tournaments", tournamentId, "participants");
    const q = query(participantsRef, orderBy("joinedAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<{ userId: string, username: string, joinedAt: any }, 'id'>)
    }));
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    return [];
  }
};