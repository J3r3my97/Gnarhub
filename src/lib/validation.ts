import { TerrainTag } from '@/types';

// Constants
export const RATE_MIN = 20;
export const RATE_MAX = 500;
export const MESSAGE_MAX_LENGTH = 1000;
export const BIO_MAX_LENGTH = 500;
export const NOTES_MAX_LENGTH = 500;

// Validation result type
interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Sanitize string - trim and remove potentially dangerous characters
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .slice(0, 2000); // Cap at reasonable length
}

// Validate session rate
export function validateRate(rate: number): ValidationResult {
  if (typeof rate !== 'number' || isNaN(rate)) {
    return { valid: false, error: 'Rate must be a number' };
  }
  if (rate < RATE_MIN) {
    return { valid: false, error: `Rate must be at least $${RATE_MIN}` };
  }
  if (rate > RATE_MAX) {
    return { valid: false, error: `Rate cannot exceed $${RATE_MAX}` };
  }
  return { valid: true };
}

// Validate date is not in the past
export function validateFutureDate(dateString: string): ValidationResult {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return { valid: false, error: 'Date cannot be in the past' };
  }
  return { valid: true };
}

// Validate time format (HH:MM)
export function validateTime(time: string): ValidationResult {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { valid: false, error: 'Invalid time format' };
  }
  return { valid: true };
}

// Validate time range (end after start)
export function validateTimeRange(startTime: string, endTime: string): ValidationResult {
  const startValid = validateTime(startTime);
  if (!startValid.valid) return startValid;

  const endValid = validateTime(endTime);
  if (!endValid.valid) return endValid;

  if (startTime >= endTime) {
    return { valid: false, error: 'End time must be after start time' };
  }
  return { valid: true };
}

// Validate terrain tags
export function validateTerrainTags(tags: TerrainTag[]): ValidationResult {
  const validTags: TerrainTag[] = ['park', 'all-mountain', 'groomers'];

  if (!Array.isArray(tags) || tags.length === 0) {
    return { valid: false, error: 'At least one terrain type is required' };
  }

  for (const tag of tags) {
    if (!validTags.includes(tag)) {
      return { valid: false, error: `Invalid terrain tag: ${tag}` };
    }
  }
  return { valid: true };
}

// Validate message/notes (non-empty, reasonable length)
export function validateMessage(message: string, maxLength = MESSAGE_MAX_LENGTH): ValidationResult {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (message.length > maxLength) {
    return { valid: false, error: `Message cannot exceed ${maxLength} characters` };
  }
  return { valid: true };
}

// Validate review rating
export function validateRating(rating: number): ValidationResult {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return { valid: false, error: 'Rating must be a number' };
  }
  if (rating < 1 || rating > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' };
  }
  if (!Number.isInteger(rating)) {
    return { valid: false, error: 'Rating must be a whole number' };
  }
  return { valid: true };
}

// Validate URL (for sample work URLs)
export function validateUrl(url: string): ValidationResult {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// Validate mountain ID exists
export function validateMountainId(mountainId: string, validMountainIds: string[]): ValidationResult {
  if (!mountainId) {
    return { valid: false, error: 'Mountain is required' };
  }
  if (!validMountainIds.includes(mountainId)) {
    return { valid: false, error: 'Invalid mountain selection' };
  }
  return { valid: true };
}

// Composite validators for forms

export interface SessionFormData {
  mountainId: string;
  date: string;
  startTime: string;
  endTime: string;
  terrainTags: TerrainTag[];
  rate: number;
  notes?: string;
}

export function validateSessionForm(
  data: SessionFormData,
  validMountainIds: string[]
): ValidationResult {
  const mountainResult = validateMountainId(data.mountainId, validMountainIds);
  if (!mountainResult.valid) return mountainResult;

  const dateResult = validateFutureDate(data.date);
  if (!dateResult.valid) return dateResult;

  const timeResult = validateTimeRange(data.startTime, data.endTime);
  if (!timeResult.valid) return timeResult;

  const terrainResult = validateTerrainTags(data.terrainTags);
  if (!terrainResult.valid) return terrainResult;

  const rateResult = validateRate(data.rate);
  if (!rateResult.valid) return rateResult;

  if (data.notes && data.notes.length > NOTES_MAX_LENGTH) {
    return { valid: false, error: `Notes cannot exceed ${NOTES_MAX_LENGTH} characters` };
  }

  return { valid: true };
}

export interface RequestFormData {
  message: string;
  terrainTags: TerrainTag[];
}

export function validateRequestForm(data: RequestFormData): ValidationResult {
  const messageResult = validateMessage(data.message);
  if (!messageResult.valid) return messageResult;

  // Terrain tags are optional for requests
  if (data.terrainTags.length > 0) {
    const terrainResult = validateTerrainTags(data.terrainTags);
    if (!terrainResult.valid) return terrainResult;
  }

  return { valid: true };
}

export interface ReviewFormData {
  rating: number;
  text: string;
}

export function validateReviewForm(data: ReviewFormData): ValidationResult {
  const ratingResult = validateRating(data.rating);
  if (!ratingResult.valid) return ratingResult;

  const textResult = validateMessage(data.text, 1000);
  if (!textResult.valid) return textResult;

  return { valid: true };
}

export interface CounterOfferFormData {
  startTime: string;
  endTime: string;
  amount: number;
  message?: string;
}

export function validateCounterOfferForm(data: CounterOfferFormData): ValidationResult {
  const timeResult = validateTimeRange(data.startTime, data.endTime);
  if (!timeResult.valid) return timeResult;

  const rateResult = validateRate(data.amount);
  if (!rateResult.valid) return rateResult;

  if (data.message && data.message.length > MESSAGE_MAX_LENGTH) {
    return { valid: false, error: `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters` };
  }

  return { valid: true };
}
