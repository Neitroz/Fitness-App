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
  entries: WorkoutEntry[];
}

export const MUSCLE_GROUPS = [
  "Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", 
  "Quadriceps", "Ischios", "Fessiers", "Mollets", 
  "Abdominaux", "Lombaires", "Autre"
];
