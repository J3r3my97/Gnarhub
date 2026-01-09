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
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Session, SessionRequest, Conversation, Message, Review, CounterOffer } from '@/types';

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
  startDate?: string;
  endDate?: string;
} = {}): Promise<Session[]> {
  if (!db) return [];

  const { limitDays = 14, limitCount = 50, mountainId, terrainTags, startDate, endDate } = options;

  // Calculate date range - use explicit dates if provided, otherwise use limitDays
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // 'yyyy-MM-dd'

  let queryStartDate = startDate || todayStr;
  let queryEndDate = endDate;

  if (!queryEndDate) {
    const endDateObj = new Date(today);
    endDateObj.setDate(endDateObj.getDate() + limitDays);
    queryEndDate = endDateObj.toISOString().split('T')[0];
  }

  // Ensure start date is not in the past
  if (queryStartDate < todayStr) {
    queryStartDate = todayStr;
  }

  // Build query - get all open sessions in the date range
  const q = query(
    collection(db, 'sessions'),
    where('status', '==', 'open'),
    where('date', '>=', queryStartDate),
    where('date', '<=', queryEndDate),
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

// Cancel a session (sets status to cancelled)
export async function cancelSession(sessionId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'sessions', sessionId), {
    status: 'cancelled',
    updatedAt: Timestamp.now(),
  });
}

// Delete a session (only if it has no requests)
export async function deleteSession(sessionId: string): Promise<void> {
  if (!db) return;
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'sessions', sessionId));
}

// Check if a session has any requests
export async function sessionHasRequests(sessionId: string): Promise<boolean> {
  if (!db) return false;
  const q = query(
    collection(db, 'sessionRequests'),
    where('sessionId', '==', sessionId),
    firestoreLimit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Session Requests
export async function createSessionRequest(
  data: Omit<SessionRequest, 'id' | 'createdAt' | 'respondedAt' | 'counterOffer'>
): Promise<string> {
  if (!db) throw new Error('Database not initialized');

  const docRef = await addDoc(collection(db, 'sessionRequests'), {
    ...data,
    counterOffer: null,
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

/**
 * Decline all other pending/counter_offered requests for a session when one is accepted
 */
export async function declineOtherSessionRequests(
  sessionId: string,
  acceptedRequestId: string
): Promise<void> {
  if (!db) return;

  // Query pending requests for this session
  const qPending = query(
    collection(db, 'sessionRequests'),
    where('sessionId', '==', sessionId),
    where('status', '==', 'pending')
  );
  const snapshotPending = await getDocs(qPending);

  // Query counter_offered requests for this session
  const qCounter = query(
    collection(db, 'sessionRequests'),
    where('sessionId', '==', sessionId),
    where('status', '==', 'counter_offered')
  );
  const snapshotCounter = await getDocs(qCounter);

  const allDocs = [...snapshotPending.docs, ...snapshotCounter.docs];

  // Update each non-accepted request to declined
  const updates = allDocs
    .filter((d) => d.id !== acceptedRequestId)
    .map((d) =>
      updateDoc(d.ref, {
        status: 'declined',
        respondedAt: Timestamp.now(),
      })
    );

  await Promise.all(updates);
}

/**
 * Atomically accept a session request and book the session.
 * Uses Firestore transaction to prevent race conditions.
 * Returns success/error for UI feedback.
 */
export async function acceptSessionRequestAtomic(
  requestId: string,
  sessionId: string,
  riderId: string
): Promise<{ success: boolean; error?: string }> {
  if (!db) return { success: false, error: 'Database not initialized' };

  const firestore = db; // Local const for TypeScript narrowing

  try {
    await runTransaction(firestore, async (transaction) => {
      // Read session first
      const sessionRef = doc(firestore, 'sessions', sessionId);
      const sessionDoc = await transaction.get(sessionRef);

      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }

      const sessionData = sessionDoc.data();

      // Check if session is still open
      if (sessionData.status !== 'open') {
        throw new Error('Session is no longer available');
      }

      // Read the request
      const requestRef = doc(firestore, 'sessionRequests', requestId);
      const requestDoc = await transaction.get(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Request not found');
      }

      const requestData = requestDoc.data();
      if (requestData.status !== 'pending' && requestData.status !== 'counter_offered') {
        throw new Error('Request is no longer pending');
      }

      // All checks passed - perform the writes atomically
      transaction.update(requestRef, {
        status: 'accepted',
        respondedAt: Timestamp.now(),
      });

      transaction.update(sessionRef, {
        status: 'booked',
        riderId: riderId,
        requestId: requestId,
        updatedAt: Timestamp.now(),
      });
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Counter Offers
export async function createCounterOffer(
  requestId: string,
  counterOffer: Omit<CounterOffer, 'id' | 'createdAt' | 'status'>
): Promise<void> {
  if (!db) return;
  const counterId = `co_${Date.now()}`;
  await updateDoc(doc(db, 'sessionRequests', requestId), {
    status: 'counter_offered',
    counterOffer: {
      id: counterId,
      ...counterOffer,
      status: 'pending',
      createdAt: Timestamp.now(),
    },
    respondedAt: Timestamp.now(),
  });
}

/**
 * Atomically accept a counter offer and book the session.
 * Uses Firestore transaction to prevent race conditions.
 * Returns success/error for UI feedback.
 */
export async function acceptCounterOffer(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  if (!db) return { success: false, error: 'Database not initialized' };

  const firestore = db; // Local const for TypeScript narrowing

  // Get the request to access the counter offer details (outside transaction for read)
  const request = await getSessionRequest(requestId);
  if (!request || !request.counterOffer) {
    return { success: false, error: 'Counter offer not found' };
  }

  try {
    await runTransaction(firestore, async (transaction) => {
      // Read session first
      const sessionRef = doc(firestore, 'sessions', request.sessionId);
      const sessionDoc = await transaction.get(sessionRef);

      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }

      const sessionData = sessionDoc.data();

      // Check if session is still open
      if (sessionData.status !== 'open') {
        throw new Error('Session is no longer available');
      }

      // Read the request to verify status
      const requestRef = doc(firestore, 'sessionRequests', requestId);
      const requestDoc = await transaction.get(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Request not found');
      }

      const requestData = requestDoc.data();
      if (requestData.status !== 'counter_offered') {
        throw new Error('Request status has changed');
      }

      // All checks passed - perform the writes atomically
      transaction.update(requestRef, {
        status: 'accepted',
        amount: request.counterOffer!.amount,
        'counterOffer.status': 'accepted',
        respondedAt: Timestamp.now(),
      });

      transaction.update(sessionRef, {
        status: 'booked',
        riderId: request.riderId,
        requestId: requestId,
        startTime: request.counterOffer!.startTime,
        endTime: request.counterOffer!.endTime,
        rate: request.counterOffer!.amount,
        updatedAt: Timestamp.now(),
      });
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function declineCounterOffer(requestId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'sessionRequests', requestId), {
    status: 'declined',
    'counterOffer.status': 'declined',
    respondedAt: Timestamp.now(),
  });
}

// Conversations
export async function createConversation(
  sessionId: string,
  participants: string[]
): Promise<string> {
  if (!db) throw new Error('Database not initialized');

  // Check if conversation already exists for this session WITH THESE SPECIFIC PARTICIPANTS
  const existing = await getConversationBySessionAndParticipants(sessionId, participants);
  if (existing) {
    return existing.id;
  }

  const docRef = await addDoc(collection(db, 'conversations'), {
    sessionId,
    participants,
    createdAt: Timestamp.now(),
    lastMessageAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Find a conversation for a specific session with specific participants
 */
export async function getConversationBySessionAndParticipants(
  sessionId: string,
  participants: string[]
): Promise<Conversation | null> {
  if (!db) return null;

  // Query conversations for this session
  const q = query(collection(db, 'conversations'), where('sessionId', '==', sessionId));
  const snapshot = await getDocs(q);

  // Filter client-side to find exact participant match (order-independent)
  const sortedTarget = [...participants].sort();
  for (const docSnap of snapshot.docs) {
    const convo = { id: docSnap.id, ...docSnap.data() } as Conversation;
    const sortedConvo = [...convo.participants].sort();
    if (
      sortedConvo.length === sortedTarget.length &&
      sortedConvo.every((p, i) => p === sortedTarget[i])
    ) {
      return convo;
    }
  }

  return null;
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
