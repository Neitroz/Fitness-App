import { useState, useEffect } from 'react';
import { Exercise, WorkoutSession } from '../types';
import { demoExercises, demoWorkouts } from '../demoData';

export function useWorkoutStore() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedExercises = localStorage.getItem('ironflow_exercises');
    const storedWorkouts = localStorage.getItem('ironflow_workouts');
    const storedUnit = localStorage.getItem('ironflow_unit');

    if (storedExercises) {
      let parsed = JSON.parse(storedExercises);
      // Migration: muscleGroup (string) -> muscleGroups (array)
      parsed = parsed.map((ex: any) => {
        if (!ex.muscleGroups && ex.muscleGroup) {
          return {
            ...ex,
            muscleGroups: [ex.muscleGroup],
          };
        }
        if (!ex.muscleGroups) {
          return {
            ...ex,
            muscleGroups: ["Autre"],
          };
        }
        return ex;
      });
      setExercises(parsed);
    } else {
      setExercises(demoExercises);
    }

    if (storedWorkouts) {
      setWorkouts(JSON.parse(storedWorkouts));
    } else {
      setWorkouts(demoWorkouts);
    }

    if (storedUnit) {
      setUnit(storedUnit as 'kg' | 'lbs');
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ironflow_exercises', JSON.stringify(exercises));
    }
  }, [exercises, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ironflow_workouts', JSON.stringify(workouts));
    }
  }, [workouts, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ironflow_unit', unit);
    }
  }, [unit, isLoaded]);

  const addExercise = (exercise: Exercise) => {
    setExercises(prev => [...prev, exercise]);
  };

  const updateExercise = (exercise: Exercise) => {
    setExercises(prev => prev.map(e => e.id === exercise.id ? exercise : e));
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
    // Also remove any related workout entries? Or keep them as orphans?
    // User requirement doesn't specify, but usually better to keep history.
  };

  const addWorkout = (workout: WorkoutSession) => {
    setWorkouts(prev => [workout, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateWorkout = (workout: WorkoutSession) => {
    setWorkouts(prev => prev.map(w => w.id === workout.id ? workout : w));
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const exportData = () => {
    const data = { exercises, workouts, unit };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ironflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.exercises) setExercises(data.exercises);
      if (data.workouts) setWorkouts(data.workouts);
      if (data.unit) setUnit(data.unit);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return {
    exercises,
    workouts,
    unit,
    setUnit,
    addExercise,
    updateExercise,
    deleteExercise,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    exportData,
    importData,
    isLoaded
  };
}
