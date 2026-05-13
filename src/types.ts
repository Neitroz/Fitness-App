/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[]; // Changed from muscleGroup: string
  description?: string;
  imageUrl?: string | null;
  isUnilateral: boolean;
  createdAt: string;
}

export type Side = "left" | "right" | "both";

export interface Set {
  id: string;
  setNumber: number;
  weight: number;
  unit: "kg" | "lbs";
  reps: number;
  rir: number | null;
  side: Side;
}

export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  sets: Set[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  notes?: string;
  status?: 'draft' | 'completed';
  entries: WorkoutEntry[];
  isShared?: boolean;
}

export interface BodyMetric {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
  lastActive: string;
  height?: number;
  isPublic?: boolean;
  xp?: number;
  level?: number;
}

export interface ManualPR {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  isWeighted?: boolean;
  bodyWeight?: number;
  isShared?: boolean;
}

export type VolumeTargets = Record<string, number>;

export const MUSCLE_GROUPS = [
  "Pectoraux", 
  "Lats", 
  "Trapèzes",
  "Épaules (Antérieur)", 
  "Épaules (Latéral)", 
  "Épaules (Postérieur)",
  "Biceps", 
  "Triceps", 
  "Quadriceps", 
  "Ischios", 
  "Fessiers", 
  "Mollets", 
  "Abdominaux", 
  "Lombaires", 
  "Autre"
];
