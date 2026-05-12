import { Exercise, WorkoutSession } from "./types";
import { v4 as uuidv4 } from 'uuid'; // I'll need to install uuid

export const demoExercises: Exercise[] = [
  {
    id: "ex-1",
    name: "Développé couché",
    muscleGroups: ["Pectoraux", "Triceps", "Épaules"],
    description: "Exercice de poussée horizontal...",
    isUnilateral: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "ex-2",
    name: "Squat barre",
    muscleGroups: ["Quadriceps", "Fessiers", "Lombaires"],
    description: "Exercice polyarticulaire pour les membres inférieurs.",
    isUnilateral: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "ex-3",
    name: "Tractions lestées",
    muscleGroups: ["Dos", "Biceps"],
    description: "Tirage vertical au poids du corps avec lest.",
    isUnilateral: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "ex-4",
    name: "Curl haltère",
    muscleGroups: ["Biceps"],
    description: "Isolation des biceps avec haltères.",
    isUnilateral: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "ex-5",
    name: "Développé militaire",
    muscleGroups: ["Épaules", "Triceps"],
    description: "Poussée verticale barre au-dessus de la tête.",
    isUnilateral: false,
    createdAt: new Date().toISOString()
  }
];

// Helper to generate dates for demo
const getDateOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const demoWorkouts: WorkoutSession[] = [
  {
    id: "w-1",
    date: getDateOffset(10),
    name: "Push Session A",
    notes: "Bon feeling, énergie haute.",
    entries: [
      {
        id: "e-1-1",
        exerciseId: "ex-1",
        sets: [
          { id: "s-1-1-1", setNumber: 1, weight: 60, unit: "kg", reps: 10, rir: 2, side: "both" },
          { id: "s-1-1-2", setNumber: 2, weight: 60, unit: "kg", reps: 10, rir: 1, side: "both" },
          { id: "s-1-1-3", setNumber: 3, weight: 60, unit: "kg", reps: 8, rir: 0, side: "both" },
        ]
      },
      {
        id: "e-1-2",
        exerciseId: "ex-5",
        sets: [
          { id: "s-1-2-1", setNumber: 1, weight: 40, unit: "kg", reps: 8, rir: 2, side: "both" },
          { id: "s-1-2-2", setNumber: 2, weight: 40, unit: "kg", reps: 8, rir: 2, side: "both" },
        ]
      }
    ]
  },
  {
    id: "w-2",
    date: getDateOffset(5),
    name: "Pull & Legs",
    notes: "Focus sur la technique au squat.",
    entries: [
      {
        id: "e-2-1",
        exerciseId: "ex-2",
        sets: [
          { id: "s-2-1-1", setNumber: 1, weight: 80, unit: "kg", reps: 8, rir: 2, side: "both" },
          { id: "s-2-1-2", setNumber: 2, weight: 80, unit: "kg", reps: 8, rir: 1, side: "both" },
        ]
      },
      {
        id: "e-2-2",
        exerciseId: "ex-3",
        sets: [
          { id: "s-2-2-1", setNumber: 1, weight: 0, unit: "kg", reps: 12, rir: 2, side: "both" },
          { id: "s-2-2-2", setNumber: 2, weight: 0, unit: "kg", reps: 10, rir: 1, side: "both" },
        ]
      }
    ]
  },
  {
    id: "w-3",
    date: getDateOffset(2),
    name: "Push Session B",
    notes: "Progression au bench.",
    entries: [
      {
        id: "e-3-1",
        exerciseId: "ex-1",
        sets: [
          { id: "s-3-1-1", setNumber: 1, weight: 62.5, unit: "kg", reps: 10, rir: 2, side: "both" },
          { id: "s-3-1-2", setNumber: 2, weight: 62.5, unit: "kg", reps: 9, rir: 1, side: "both" },
          { id: "s-3-1-3", setNumber: 3, weight: 62.5, unit: "kg", reps: 7, rir: 0, side: "both" },
        ]
      },
      {
        id: "e-3-2",
        exerciseId: "ex-4",
        sets: [
          { id: "s-3-2-1", setNumber: 1, weight: 12, unit: "kg", reps: 12, rir: 2, side: "left" },
          { id: "s-3-2-2", setNumber: 2, weight: 12, unit: "kg", reps: 12, rir: 2, side: "right" },
        ]
      }
    ]
  }
];
