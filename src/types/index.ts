import { Timestamp } from 'firebase/firestore';

// Enums
export type Pass = 'ikon' | 'epic' | 'indy' | 'local' | 'other';
export type TerrainTag = 'park' | 'all-mountain' | 'groomers';
export type SessionStatus = 'open' | 'booked' | 'completed' | 'cancelled';
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed' | 'counter_offered';
export type CounterOfferStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type UserStatus = 'active' | 'suspended' | 'deleted';

// User
export interface User {
  id: string;
  email: string;
  displayName: string;
  profilePhoto: string | null;
  createdAt: Timestamp;

  // Profile info
  bio: string;
  passes: Pass[];
  homeMountains: string[];
  terrainTags: TerrainTag[];

  // Filmer-specific (optional)
  isFilmer: boolean;
  gear: string | null;
  sampleWorkUrls: string[];
  sessionRate: number | null;
  stripeAccountId: string | null;

  // Stats
  sessionsAsRider: number;
  sessionsAsFilmer: number;
  averageRating: number | null;
  reviewCount: number;

  // Admin
  isAdmin?: boolean;
  status?: UserStatus;
}

// Mountain
export interface Mountain {
  id: string;
  name: string;
  state: string;
  passes: Pass[];
  region: string;
}

// Session (filmer availability)
export interface Session {
  id: string;
  filmerId: string;
  status: SessionStatus;

  // When/where
  mountainId: string;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'

  // What
  terrainTags: TerrainTag[];
  notes: string | null;
  rate: number;

  // Booking
  riderId: string | null;
  requestId: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Counter Offer (from filmer to rider)
export interface CounterOffer {
  id: string;
  startTime: string;
  endTime: string;
  amount: number;
  message: string;
  status: CounterOfferStatus;
  createdAt: Timestamp;
}

// Session Request
export interface SessionRequest {
  id: string;
  sessionId: string;
  riderId: string;
  filmerId: string;

  status: RequestStatus;

  // Rider info for this request
  message: string;
  riderTerrainLevel: TerrainTag[];

  // Payment
  amount: number;
  stripePaymentIntentId: string | null;

  // Counter offer from filmer
  counterOffer: CounterOffer | null;

  createdAt: Timestamp;
  respondedAt: Timestamp | null;
}

// Conversation
export interface Conversation {
  id: string;
  sessionId: string;
  participants: string[];
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
}

// Message
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

// Review
export interface Review {
  id: string;
  sessionId: string;
  filmerId: string;
  riderId: string;

  rating: number; // 1-5
  text: string;

  // Quick tags
  couldKeepUp: boolean;
  goodQuality: boolean;
  goodVibes: boolean;

  createdAt: Timestamp;
}

// Helper types for forms/UI (without Timestamp)
export type UserFormData = Omit<User, 'id' | 'createdAt' | 'sessionsAsRider' | 'sessionsAsFilmer' | 'averageRating' | 'reviewCount'>;
export type SessionFormData = Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'riderId' | 'requestId' | 'status' | 'filmerId'>;
export type RequestFormData = Pick<SessionRequest, 'message' | 'riderTerrainLevel'>;
export type ReviewFormData = Pick<Review, 'rating' | 'text' | 'couldKeepUp' | 'goodQuality' | 'goodVibes'>;
