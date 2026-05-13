import { UserStats, WorkoutSession } from '../types';

export const XP_PER_SESSION = 100;
export const XP_PER_PROGRESSION = 50;
export const XP_PER_PR = 200;
export const XP_STREAK_BONUS = 20;

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  // Quadratic scaling: Level 2 needs 100 XP, Level 3 needs 250, etc.
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (xp >= getXPForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function getXPProgress(xp: number) {
  const currentLevel = getLevelFromXP(xp);
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const progressInLevel = xp - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  const percentage = (progressInLevel / xpNeededForNext) * 100;

  return {
    currentLevel,
    progressInLevel,
    xpNeededForNext,
    percentage,
    xpToNext: nextLevelXP - xp
  };
}

/**
 * XP Rules:
 * - Session Completion: 100 XP
 * - Performance Growth (if previous workouts exist): +50 XP
 * - Intensity Bonus (more than 5 sets total): +20 XP
 * - Persistence Bonus (Streak > 3 days): +30 XP
 */
export function calculateWorkoutXP(
  session: WorkoutSession, 
  previousWorkouts: WorkoutSession[]
): { total: number; breakdown: { label: string; xp: number }[] } {
  const breakdown: { label: string; xp: number }[] = [];
  let total = 0;

  // 1. Session XP
  total += XP_PER_SESSION;
  breakdown.push({ label: 'Séance terminée', xp: XP_PER_SESSION });

  // 2. Progression Heuristic
  // If this workout has more entries than the average or simply if it's not the first.
  if (previousWorkouts.length > 0) {
    total += XP_PER_PROGRESSION;
    breakdown.push({ label: 'Progression & Surcharge', xp: XP_PER_PROGRESSION });
  }

  // 3. Intensity Bonus
  const totalSets = session.entries.reduce((acc, e) => acc + e.sets.length, 0);
  if (totalSets > 5) {
    total += 20;
    breakdown.push({ label: 'Volume Intime', xp: 20 });
  }

  return { total, breakdown };
}

export function getRank(level: number): { label: string; color: string } {
  if (level < 5) return { label: 'Bronze', color: '#cd7f32' };
  if (level < 15) return { label: 'Argent', color: '#c0c0c0' };
  if (level < 30) return { label: 'Or', color: '#ffd700' };
  if (level < 50) return { label: 'Platine', color: '#e5e4e2' };
  return { label: 'Diamant', color: '#b9f2ff' };
}
