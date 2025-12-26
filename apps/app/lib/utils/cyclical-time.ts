/**
 * Cyclical Time Feature Encoding
 * 
 * Converts time-based features (hour, day of week, month) into cyclical
 * sine/cosine representations to preserve temporal continuity.
 * 
 * This solves the "time-blind" model problem where 23:00 and 00:00 are
 * treated as far apart when they're actually adjacent.
 * 
 * Formula: x_sin = sin(x * 2π / period)
 *          x_cos = cos(x * 2π / period)
 * 
 * @see https://towardsdatascience.com/is-your-model-time-blind-the-case-for-cyclical-feature-encoding/
 */

export interface CyclicalTimeFeatures {
  hour_sin: number;
  hour_cos: number;
  dow_sin: number;  // day of week (0=Sunday, 6=Saturday)
  dow_cos: number;
  mon_sin: number;   // month (0=January, 11=December)
  mon_cos: number;
}

/**
 * Encode time features cyclically
 * 
 * @param date - Date object to encode
 * @returns Cyclical time features (sine/cosine pairs)
 * 
 * @example
 * ```typescript
 * const now = new Date();
 * const features = encodeCyclicalTime(now);
 * // features.hour_sin, features.hour_cos represent hour of day
 * // features.dow_sin, features.dow_cos represent day of week
 * // features.mon_sin, features.mon_cos represent month
 * ```
 */
export function encodeCyclicalTime(date: Date): CyclicalTimeFeatures {
  const hour = date.getHours(); // 0-23
  const dayOfWeek = date.getDay(); // 0-6 (Sunday=0)
  const month = date.getMonth(); // 0-11 (January=0)
  
  return {
    hour_sin: Math.sin(hour * 2 * Math.PI / 24),
    hour_cos: Math.cos(hour * 2 * Math.PI / 24),
    dow_sin: Math.sin(dayOfWeek * 2 * Math.PI / 7),
    dow_cos: Math.cos(dayOfWeek * 2 * Math.PI / 7),
    mon_sin: Math.sin(month * 2 * Math.PI / 12),
    mon_cos: Math.cos(month * 2 * Math.PI / 12),
  };
}

/**
 * Decode cyclical features back to approximate time
 * Useful for debugging and interpretation
 * 
 * @param features - Cyclical time features
 * @returns Approximate hour, day of week, and month
 */
export function decodeCyclicalTime(features: CyclicalTimeFeatures): {
  approximateHour: number;
  approximateDayOfWeek: number;
  approximateMonth: number;
} {
  // Use atan2 to get angle, then convert back to original scale
  let hour = Math.round(
    Math.atan2(features.hour_sin, features.hour_cos) * 24 / (2 * Math.PI)
  ) % 24;
  if (hour < 0) hour += 24;
  
  let dayOfWeek = Math.round(
    Math.atan2(features.dow_sin, features.dow_cos) * 7 / (2 * Math.PI)
  ) % 7;
  if (dayOfWeek < 0) dayOfWeek += 7;
  
  let month = Math.round(
    Math.atan2(features.mon_sin, features.mon_cos) * 12 / (2 * Math.PI)
  ) % 12;
  if (month < 0) month += 12;
  
  return { 
    approximateHour: hour, 
    approximateDayOfWeek: dayOfWeek, 
    approximateMonth: month 
  };
}

/**
 * Get time period label from cyclical features
 * Useful for human-readable time context
 * 
 * @param features - Cyclical time features
 * @returns Human-readable time period labels
 */
export function getTimePeriodLabels(features: CyclicalTimeFeatures): {
  timeOfDay: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'late_night' | 'night';
  dayType: 'weekday' | 'weekend';
  season?: 'spring' | 'summer' | 'fall' | 'winter';
} {
  const { approximateHour, approximateDayOfWeek } = decodeCyclicalTime(features);
  
  // Time of day classification
  let timeOfDay: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'late_night' | 'night';
  if (approximateHour >= 5 && approximateHour < 12) {
    timeOfDay = 'morning';
  } else if (approximateHour >= 12 && approximateHour < 17) {
    timeOfDay = 'afternoon';
  } else if (approximateHour >= 17 && approximateHour < 21) {
    timeOfDay = 'evening';
  } else if (approximateHour >= 21 || approximateHour < 2) {
    timeOfDay = 'late_night';
  } else {
    timeOfDay = 'night';
  }
  
  // Day type
  const dayType: 'weekday' | 'weekend' = (approximateDayOfWeek === 0 || approximateDayOfWeek === 6) 
    ? 'weekend' 
    : 'weekday';
  
  // Season (optional, based on month)
  const { approximateMonth } = decodeCyclicalTime(features);
  let season: 'spring' | 'summer' | 'fall' | 'winter' | undefined;
  if (approximateMonth >= 2 && approximateMonth < 5) {
    season = 'spring';
  } else if (approximateMonth >= 5 && approximateMonth < 8) {
    season = 'summer';
  } else if (approximateMonth >= 8 && approximateMonth < 11) {
    season = 'fall';
  } else {
    season = 'winter';
  }
  
  return { timeOfDay, dayType, season };
}

/**
 * Calculate time similarity between two time points
 * Returns a value between 0 (completely different) and 1 (identical)
 * 
 * @param features1 - First time features
 * @param features2 - Second time features
 * @returns Similarity score (0-1)
 */
export function calculateTimeSimilarity(
  features1: CyclicalTimeFeatures,
  features2: CyclicalTimeFeatures
): number {
  // Calculate cosine similarity for each dimension
  const hourSimilarity = (
    features1.hour_sin * features2.hour_sin + 
    features1.hour_cos * features2.hour_cos
  ) / 2 + 0.5; // Normalize to 0-1
  
  const dowSimilarity = (
    features1.dow_sin * features2.dow_sin + 
    features1.dow_cos * features2.dow_cos
  ) / 2 + 0.5;
  
  const monSimilarity = (
    features1.mon_sin * features2.mon_sin + 
    features1.mon_cos * features2.mon_cos
  ) / 2 + 0.5;
  
  // Weighted average (hour is most important for short-term patterns)
  return hourSimilarity * 0.5 + dowSimilarity * 0.3 + monSimilarity * 0.2;
}

