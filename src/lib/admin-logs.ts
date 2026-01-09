import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { AdminLog } from '@/types/admin';

/**
 * Log an admin action for audit trail
 */
export async function logAdminAction(
  action: AdminLog['action'],
  adminId: string,
  adminName: string,
  targetId: string,
  targetType: AdminLog['targetType'],
  targetName?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!db) return;

  await addDoc(collection(db, 'adminLogs'), {
    action,
    adminId,
    adminName,
    targetId,
    targetType,
    targetName,
    metadata: metadata || {},
    timestamp: Timestamp.now(),
  });
}

/**
 * Get recent admin logs
 */
export async function getAdminLogs(limitCount: number = 50): Promise<AdminLog[]> {
  if (!db) return [];

  const q = query(
    collection(db, 'adminLogs'),
    orderBy('timestamp', 'desc'),
    firestoreLimit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AdminLog));
}
