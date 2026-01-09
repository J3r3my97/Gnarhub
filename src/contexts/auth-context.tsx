'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<User | null> => {
    if (!db) return null;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  };

  // Create new user in Firestore
  const createUserInFirestore = async (
    firebaseUser: FirebaseUser,
    displayName?: string
  ): Promise<User | null> => {
    if (!db) return null;
    const newUser: Omit<User, 'id'> = {
      email: firebaseUser.email || '',
      displayName: displayName || firebaseUser.displayName || 'User',
      profilePhoto: firebaseUser.photoURL,
      createdAt: Timestamp.now(),
      bio: '',
      passes: [],
      homeMountains: [],
      terrainTags: [],
      isFilmer: false,
      gear: null,
      sampleWorkUrls: [],
      sessionRate: null,
      stripeAccountId: null,
      sessionsAsRider: 0,
      sessionsAsFilmer: 0,
      averageRating: null,
      reviewCount: 0,
      isAdmin: false,
      status: 'active',
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    return { id: firebaseUser.uid, ...newUser };
  };

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        let userData = await fetchUserData(firebaseUser.uid);
        if (!userData) {
          userData = await createUserInFirestore(firebaseUser);
        }
        setUser(userData);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error('Firebase not initialized');
    const result = await signInWithPopup(auth, googleProvider);
    let userData = await fetchUserData(result.user.uid);
    if (!userData) {
      userData = await createUserInFirestore(result.user);
    }
    setUser(userData);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userData = await fetchUserData(result.user.uid);
    setUser(userData);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const userData = await createUserInFirestore(result.user, displayName);
    setUser(userData);
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await fetchUserData(firebaseUser.uid);
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
