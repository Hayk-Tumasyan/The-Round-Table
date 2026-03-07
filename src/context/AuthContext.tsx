import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase.ts'; 
import { User, UserRole } from '../types.ts';
import { getUserDossier, createUserDossier } from '../services/userService';

interface AuthContextType {
  user: User | null;
  logout: () => void;
  loading: boolean;
  updateUser: (data: Partial<User>) => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (data: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...data } : null));
  };

  useEffect(() => {
    let unsubDossier: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let dossier = await getUserDossier(firebaseUser.uid);
        
        if (!dossier) {
          const newDossier = {
            uid: firebaseUser.uid,
            display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown Knight',
            role: (firebaseUser.email === 'hayko.tumasyan2004@gmail.com' ? 'admin' : 'user') as UserRole,
            bio: "A traveler in the realm.",
            preferred_lang: "en",
            avatar_url: "",
            isBanned: false
          };
          await createUserDossier(newDossier);
          dossier = newDossier;
        }

        unsubDossier = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
          const latestData = docSnap.data();
          if (latestData) {
            const adminEmail = 'hayko.tumasyan2004@gmail.com'; 
            const isHand = firebaseUser.email?.toLowerCase() === adminEmail.toLowerCase();

            setUser({
              id: firebaseUser.uid,
              username: latestData.display_name,
              email: firebaseUser.email || "", // <--- CAPTURE REAL EMAIL HERE
              role: isHand ? 'admin' : latestData.role,
              bio: latestData.bio,
              preferred_lang: latestData.preferred_lang,
              isBanned: latestData.isBanned || false 
            } as any);
          }
          setLoading(false);
        });

      } else {
        setUser(null);
        unsubDossier(); 
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubDossier();
    };
  }, []);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading, updateUser }}>
      {loading ? (
        <div className="min-h-screen bg-[#0f0a08] flex items-center justify-center">
          <div className="text-amber-500 medieval-font animate-pulse uppercase tracking-widest text-center">
            <p>Consulting the Archives...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};