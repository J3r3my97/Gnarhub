import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Session, SessionRequest, Conversation, Message, Review } from '@/types';

// Users
export async function getUser(userId: string): Promise<User | null> {
  if (!db) return null;
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'users', userId), data);
}

// Sessions
export async function getSessions(filters: {
  mountainId?: string;
  date?: string;
  terrainTags?: string[];
  status?: string;
}): Promise<Session[]> {
  if (!db) return [];
  let q = query(collection(db, 'sessions'), where('status', '==', filters.status || 'open'));

  if (filters.mountainId) {
    q = query(q, where('mountainId', '==', filters.mountainId));
  }

  if (filters.date) {
    q = query(q, where('date', '==', filters.date));
  }

  q = query(q, orderBy('date', 'asc'));

  const snapshot = await getDocs(q);
  let sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Session));

  // Filter by terrain tags client-side (Firestore array-contains-any limitation)
  if (filters.terrainTags && filters.terrainTags.length > 0) {
    sessions = sessions.filter((session) =>
      session.terrainTags.some((tag) => filters.terrainTags!.includes(tag))
    );
  }

  return sessions;
}

// Get all upcoming open sessions for discovery browsing
export async function getAllUpcomingSessions(options: {
  limitDays?: number;
  limitCount?: number;
  mountainId?: string;
  terrainTags?: string[];
} = {}): Promise<Session[]> {
  if (!db) return [];

  const { limitDays = 14, limitCount = 50, mountainId, terrainTags } = options;

  // Calculate date range
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // 'yyyy-MM-dd'

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + limitDays);
  const endDateStr = endDate.toISOString().split('T')[0];

  // Build query - get all open sessions from today to limitDays in the future
  let q = query(
    collection(db, 'sessions'),
    where('status', '==', 'open'),
    where('date', '>=', todayStr),
    where('date', '<=', endDateStr),
    orderBy('date', 'asc'),
    firestoreLimit(limitCount)
  );

  const snapshot = await getDocs(q);
  let sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Session));

  // Apply optional filters client-side
  if (mountainId) {
    sessions = sessions.filter((s) => s.mountainId === mountainId);
  }

  if (terrainTags && terrainTags.length > 0) {
    sessions = sessions.filter((session) =>
      session.terrainTags.some((tag) => terrainTags.includes(tag))
    );
  }

  return sessions;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  if (!db) return null;
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
  if (!sessionDoc.exists()) return null;
  return { id: sessionDoc.id, ...sessionDoc.data() } as Session;
}

export async function getFilmerSessions(filmerId: string): Promise<Session[]> {
  if (!db) return [];
  const q = query(
    collection(db, 'sessions'),
    where('filmerId', '==', filmerId),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Session));
}

export async function createSession(data: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!db) throw new Error('Database not initialized');
  const docRef = await addDoc(collection(db, 'sessions'), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateSession(sessionId: string, data: Partial<Session>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'sessions', sessionId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Session Requests
export async function createSessionRequest(
  data: Omit<SessionRequest, 'id' | 'createdAt' | 'respondedAt'>
): Promise<string> {
  if (!db) throw new Error('Database not initialized');
  const docRef = await addDoc(collection(db, 'sessionRequests'), {
    ...data,
    createdAt: Timestamp.now(),
    respondedAt: null,
  });
  return docRef.id;
}

export async function getSessionRequest(requestId: string): Promise<SessionRequest | null> {
  if (!db) return null;
  const requestDoc = await getDoc(doc(db, 'sessionRequests', requestId));
  if (!requestDoc.exists()) return null;
  return { id: requestDoc.id, ...requestDoc.data() } as SessionRequest;
}

export async function updateSessionRequest(
  requestId: string,
  data: Partial<SessionRequest>
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'sessionRequests', requestId), {
    ...data,
    respondedAt: Timestamp.now(),
  });
}

export async function getUserRequests(userId: string, asFilmer: boolean): Promise<SessionRequest[]> {
  if (!db) return [];
  const field = asFilmer ? 'filmerId' : 'riderId';
  const q = query(
    collection(db, 'sessionRequests'),
    where(field, '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SessionRequest));
}

// Conversations
export async function createConversation(
  sessionId: string,
  participants: string[]
): Promise<string> {
  if (!db) throw new Error('Database not initialized');
  const docRef = await addDoc(collection(db, 'conversations'), {
    sessionId,
    participants,
    createdAt: Timestamp.now(),
    lastMessageAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  if (!db) return null;
  const convoDoc = await getDoc(doc(db, 'conversations', conversationId));
  if (!convoDoc.exists()) return null;
  return { id: convoDoc.id, ...convoDoc.data() } as Conversation;
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  if (!db) return [];
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Conversation));
}

export async function getConversationBySession(sessionId: string): Promise<Conversation | null> {
  if (!db) return null;
  const q = query(collection(db, 'conversations'), where('sessionId', '==', sessionId), firestoreLimit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Conversation;
}

// Messages
export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<string> {
  if (!db) throw new Error('Database not initialized');
  const docRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    conversationId,
    senderId,
    text,
    createdAt: Timestamp.now(),
  });

  // Update conversation's lastMessageAt
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessageAt: Timestamp.now(),
  });

  return docRef.id;
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  });
}

// Reviews
export async function createReview(data: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  if (!db) throw new Error('Database not initialized');
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...data,
    createdAt: Timestamp.now(),
  });

  // Update filmer's average rating
  const reviewsQuery = query(collection(db, 'reviews'), where('filmerId', '==', data.filmerId));
  const reviewsSnapshot = await getDocs(reviewsQuery);
  const reviews = reviewsSnapshot.docs.map((doc) => doc.data() as Review);
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalRating / reviews.length;

  await updateDoc(doc(db, 'users', data.filmerId), {
    averageRating: avgRating,
    reviewCount: reviews.length,
  });

  return docRef.id;
}

export async function getFilmerReviews(filmerId: string): Promise<Review[]> {
  if (!db) return [];
  const q = query(
    collection(db, 'reviews'),
    where('filmerId', '==', filmerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
}
