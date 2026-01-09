import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Session, Review } from '@/types';
import { PlatformStats, UserFilters, SessionFilters } from '@/types/admin';

// Platform Stats
export async function getPlatformStats(): Promise<PlatformStats> {
  if (!db) {
    return {
      totalUsers: 0,
      totalRiders: 0,
      totalFilmers: 0,
      totalSessions: 0,
      openSessions: 0,
      bookedSessions: 0,
      completedSessions: 0,
      totalReviews: 0,
      averagePlatformRating: null,
    };
  }

  // Get user counts
  const usersSnapshot = await getCountFromServer(collection(db, 'users'));
  const totalUsers = usersSnapshot.data().count;

  const filmersQuery = query(collection(db, 'users'), where('isFilmer', '==', true));
  const filmersSnapshot = await getCountFromServer(filmersQuery);
  const totalFilmers = filmersSnapshot.data().count;

  // All users are riders (can book sessions)
  const totalRiders = totalUsers;

  // Get session counts by status
  const sessionsSnapshot = await getCountFromServer(collection(db, 'sessions'));
  const totalSessions = sessionsSnapshot.data().count;

  const openQuery = query(collection(db, 'sessions'), where('status', '==', 'open'));
  const openSnapshot = await getCountFromServer(openQuery);
  const openSessions = openSnapshot.data().count;

  const bookedQuery = query(collection(db, 'sessions'), where('status', '==', 'booked'));
  const bookedSnapshot = await getCountFromServer(bookedQuery);
  const bookedSessions = bookedSnapshot.data().count;

  const completedQuery = query(collection(db, 'sessions'), where('status', '==', 'completed'));
  const completedSnapshot = await getCountFromServer(completedQuery);
  const completedSessions = completedSnapshot.data().count;

  // Get review stats
  const reviewsSnapshot = await getCountFromServer(collection(db, 'reviews'));
  const totalReviews = reviewsSnapshot.data().count;

  // Calculate average platform rating
  let averagePlatformRating: number | null = null;
  if (totalReviews > 0) {
    const reviewsQuery = query(collection(db, 'reviews'));
    const reviewsDocs = await getDocs(reviewsQuery);
    const totalRating = reviewsDocs.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
    averagePlatformRating = Math.round((totalRating / totalReviews) * 10) / 10;
  }

  return {
    totalUsers,
    totalRiders,
    totalFilmers,
    totalSessions,
    openSessions,
    bookedSessions,
    completedSessions,
    totalReviews,
    averagePlatformRating,
  };
}

// Users Management
export async function getAllUsers(filters: UserFilters = {}): Promise<User[]> {
  if (!db) return [];

  let q = query(collection(db, 'users'));

  // Apply role filter
  if (filters.role === 'filmers') {
    q = query(q, where('isFilmer', '==', true));
  } else if (filters.role === 'admins') {
    q = query(q, where('isAdmin', '==', true));
  }

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    q = query(q, where('status', '==', filters.status));
  }

  // Apply sorting
  const sortField = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  q = query(q, orderBy(sortField, sortOrder));

  const snapshot = await getDocs(q);
  let users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));

  // Apply search filter client-side (Firestore doesn't support full-text search)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    users = users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }

  // Filter riders only client-side (users who are not filmers or have ridden)
  if (filters.role === 'riders') {
    users = users.filter((user) => !user.isFilmer || user.sessionsAsRider > 0);
  }

  return users;
}

export async function suspendUser(userId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'users', userId), {
    status: 'suspended',
  });
}

export async function activateUser(userId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'users', userId), {
    status: 'active',
  });
}

export async function promoteToAdmin(userId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'users', userId), {
    isAdmin: true,
  });
}

export async function demoteFromAdmin(userId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'users', userId), {
    isAdmin: false,
  });
}

// Sessions Management
export async function getAllSessions(filters: SessionFilters = {}): Promise<Session[]> {
  if (!db) return [];

  let q = query(collection(db, 'sessions'), orderBy('date', 'desc'));

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    q = query(collection(db, 'sessions'), where('status', '==', filters.status), orderBy('date', 'desc'));
  }

  const snapshot = await getDocs(q);
  let sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Session));

  // Apply additional filters client-side
  if (filters.mountainId) {
    sessions = sessions.filter((s) => s.mountainId === filters.mountainId);
  }

  if (filters.dateFrom) {
    sessions = sessions.filter((s) => s.date >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    sessions = sessions.filter((s) => s.date <= filters.dateTo!);
  }

  if (filters.filmerId) {
    sessions = sessions.filter((s) => s.filmerId === filters.filmerId);
  }

  return sessions;
}

// Reviews Management
export async function getAllReviews(): Promise<Review[]> {
  if (!db) return [];

  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
}

export async function deleteReview(reviewId: string, filmerId: string): Promise<void> {
  if (!db) return;

  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'reviews', reviewId));

  // Recalculate filmer's average rating
  const reviewsQuery = query(collection(db, 'reviews'), where('filmerId', '==', filmerId));
  const reviewsSnapshot = await getDocs(reviewsQuery);
  const reviews = reviewsSnapshot.docs.map((doc) => doc.data() as Review);

  if (reviews.length === 0) {
    await updateDoc(doc(db, 'users', filmerId), {
      averageRating: null,
      reviewCount: 0,
    });
  } else {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;
    await updateDoc(doc(db, 'users', filmerId), {
      averageRating: avgRating,
      reviewCount: reviews.length,
    });
  }
}

// Recent Activity
export async function getRecentSignups(limit: number = 5): Promise<User[]> {
  if (!db) return [];

  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, limit).map((doc) => ({ id: doc.id, ...doc.data() } as User));
}

export async function getRecentSessions(limit: number = 5): Promise<Session[]> {
  if (!db) return [];

  const q = query(
    collection(db, 'sessions'),
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, limit).map((doc) => ({ id: doc.id, ...doc.data() } as Session));
}
