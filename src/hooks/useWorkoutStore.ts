import { useState, useEffect } from 'react';
import { Exercise, WorkoutSession, BodyMetric, VolumeTargets, ManualPR } from '../types';
import { demoExercises, demoWorkouts } from '../demoData';

export function useWorkoutStore() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [volumeTargets, setVolumeTargets] = useState<VolumeTargets>({});
  const [manualPRs, setManualPRs] = useState<ManualPR[]>([]);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [isLoaded, setIsLoaded] = useState(false);

  const migrateExercises = (rawExercises: any[]) => {
    return rawExercises.map((ex: any) => {
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
  };

  useEffect(() => {
    const storedExercises = localStorage.getItem('ironflow_exercises');
    const storedWorkouts = localStorage.getItem('ironflow_workouts');
    const storedBodyMetrics = localStorage.getItem('ironflow_body_metrics');
    const storedHeight = localStorage.getItem('ironflow_height');
    const storedVolumeTargets = localStorage.getItem('ironflow_volume_targets');
    const storedManualPRs = localStorage.getItem('ironflow_manual_prs');
    const storedUnit = localStorage.getItem('ironflow_unit');

    if (storedExercises) {
      setExercises(migrateExercises(JSON.parse(storedExercises)));
    } else {
      setExercises(demoExercises);
    }

    if (storedWorkouts) {
      setWorkouts(JSON.parse(storedWorkouts));
    } else {
      setWorkouts(demoWorkouts);
    }

    if (storedBodyMetrics) {
      setBodyMetrics(JSON.parse(storedBodyMetrics));
    }

    if (storedHeight) {
      setUserHeight(parseFloat(storedHeight));
    }

    if (storedVolumeTargets) {
      setVolumeTargets(JSON.parse(storedVolumeTargets));
    }

    if (storedManualPRs) {
      setManualPRs(JSON.parse(storedManualPRs));
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
      localStorage.setItem('ironflow_body_metrics', JSON.stringify(bodyMetrics));
    }
  }, [bodyMetrics, isLoaded]);

  useEffect(() => {
    if (isLoaded && userHeight !== null) {
      localStorage.setItem('ironflow_height', userHeight.toString());
    }
  }, [userHeight, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ironflow_volume_targets', JSON.stringify(volumeTargets));
    }
  }, [volumeTargets, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ironflow_manual_prs', JSON.stringify(manualPRs));
    }
  }, [manualPRs, isLoaded]);

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

  const addBodyMetric = (metric: BodyMetric) => {
    setBodyMetrics(prev => [metric, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteBodyMetric = (id: string) => {
    setBodyMetrics(prev => prev.filter(m => m.id !== id));
  };

  const updateVolumeTarget = (muscle: string, target: number) => {
    setVolumeTargets(prev => ({ ...prev, [muscle]: target }));
  };

  const updateManualPR = (pr: ManualPR) => {
    setManualPRs(prev => {
      const exists = prev.find(p => p.exerciseName === pr.exerciseName);
      if (exists) {
        return prev.map(p => p.exerciseName === pr.exerciseName ? pr : p);
      }
      return [...prev, pr];
    });
  };

  const resetData = () => {
    if (confirm("Attention : Cela va supprimer TOUTES vos données (exercices et séances). Continuer ?")) {
      setExercises([]);
      setWorkouts([]);
      setBodyMetrics([]);
      setVolumeTargets({});
      localStorage.removeItem('ironflow_exercises');
      localStorage.removeItem('ironflow_workouts');
      localStorage.removeItem('ironflow_body_metrics');
      localStorage.removeItem('ironflow_volume_targets');
    }
  };

  const exportData = () => {
    const data = { exercises, workouts, bodyMetrics, volumeTargets, manualPRs, unit };
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
      if (data.exercises) setExercises(migrateExercises(data.exercises));
      if (data.workouts) setWorkouts(data.workouts);
      if (data.bodyMetrics) setBodyMetrics(data.bodyMetrics);
      if (data.volumeTargets) setVolumeTargets(data.volumeTargets);
      if (data.manualPRs) setManualPRs(data.manualPRs);
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
    bodyMetrics,
    userHeight,
    volumeTargets,
    unit,
    setUnit,
    setUserHeight,
    addExercise,
    updateExercise,
    deleteExercise,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addBodyMetric,
    deleteBodyMetric,
    updateVolumeTarget,
    updateManualPR,
    manualPRs,
    resetData,
    exportData,
    importData,
    isLoaded
  };
}
