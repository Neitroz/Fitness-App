import { useState, useEffect } from 'react';
import { Exercise, WorkoutSession, BodyMetric, VolumeTargets, ManualPR } from '../types';
import { demoExercises, demoWorkouts } from '../demoData';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

export function useWorkoutStore() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [volumeTargets, setVolumeTargets] = useState<VolumeTargets>({});
  const [manualPRs, setManualPRs] = useState<ManualPR[]>([]);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

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

  // Loading combined logic
  useEffect(() => {
    const loadLocalData = () => {
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

      if (storedBodyMetrics) setBodyMetrics(JSON.parse(storedBodyMetrics));
      if (storedHeight) setUserHeight(parseFloat(storedHeight));
      if (storedVolumeTargets) setVolumeTargets(JSON.parse(storedVolumeTargets));
      if (storedManualPRs) setManualPRs(JSON.parse(storedManualPRs));
      if (storedUnit) setUnit(storedUnit as 'kg' | 'lbs');

      setIsLoaded(true);
    };

    loadLocalData();
  }, []);

  // Firestore Sync - Load Data (when currentUser becomes available)
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      const userPath = `users/${currentUser.uid}`;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.height) setUserHeight(data.height);
          if (data.volumeTargets) setVolumeTargets(data.volumeTargets);
          if (data.unit) setUnit(data.unit);
          if (data.bodyMetrics) setBodyMetrics(data.bodyMetrics);
        }

        const prsQuery = query(collection(db, 'manual_prs'), where('userId', '==', currentUser.uid));
        const prsSnap = await getDocs(prsQuery);
        if (!prsSnap.empty) {
          setManualPRs(prsSnap.docs.map(d => ({ id: d.id, ...d.data() } as ManualPR)));
        } else if (manualPRs.length > 0) {
          manualPRs.forEach(async (pr) => {
            await addDoc(collection(db, 'manual_prs'), { ...pr, userId: currentUser.uid });
          });
        }

        const wQuery = query(collection(db, 'workouts'), where('userId', '==', currentUser.uid));
        const wSnap = await getDocs(wQuery);
        if (!wSnap.empty) {
          const cloudWorkouts = wSnap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutSession));
          // Simple merge: prefer cloud data if it exists, otherwise keep local
          setWorkouts(prev => {
            const localIds = new Set(prev.map(w => w.id));
            const newCloudWorkouts = cloudWorkouts.filter(cw => !localIds.has(cw.id));
            const updatedLocalWorkouts = prev.map(lw => {
              const cloudMatch = cloudWorkouts.find(cw => cw.id === lw.id);
              return cloudMatch || lw;
            });
            return [...updatedLocalWorkouts, ...newCloudWorkouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          });
        } else if (workouts.length > 0) {
          // Cloud is empty but we have local workouts - offer auto-sync or just do it?
          // For best UX, let's auto-sync local data to cloud on first connection
          workouts.forEach(async (w) => {
             await setDoc(doc(db, 'workouts', w.id), { ...w, userId: currentUser.uid });
          });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, userPath);
      }

      // Update last active
      const userPathActive = `users/${currentUser.uid}`;
      setDoc(doc(db, 'users', currentUser.uid), { lastActive: serverTimestamp() }, { merge: true })
        .catch(e => handleFirestoreError(e, OperationType.WRITE, userPathActive));
    };

    if (currentUser && isLoaded) {
      fetchData();
    }
  }, [currentUser, isLoaded]);

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

  const updateManualPR = async (pr: ManualPR) => {
    setManualPRs(prev => {
      const exists = prev.find(p => p.exerciseName === pr.exerciseName);
      if (exists) {
        return prev.map(p => p.exerciseName === pr.exerciseName ? pr : p);
      }
      return [...prev, pr];
    });

    if (currentUser) {
      const prPath = `manual_prs/${pr.exerciseName}`;
      try {
        const prsQuery = query(collection(db, 'manual_prs'), where('userId', '==', currentUser.uid), where('exerciseName', '==', pr.exerciseName));
        const prsSnap = await getDocs(prsQuery);
        if (!prsSnap.empty) {
          await updateDoc(doc(db, 'manual_prs', prsSnap.docs[0].id), { ...pr, userId: currentUser.uid });
        } else {
          await addDoc(collection(db, 'manual_prs'), { ...pr, userId: currentUser.uid });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, prPath);
      }
    }
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
    currentUser,
    isAuthLoading,
    updateProfile: async (data: { displayName?: string, photoURL?: string, bio?: string }) => {
      if (!currentUser) return;
      const userPath = `users/${currentUser.uid}`;
      try {
        await updateProfile(currentUser, { 
          displayName: data.displayName || currentUser.displayName,
          photoURL: data.photoURL || currentUser.photoURL 
        });
        await setDoc(doc(db, 'users', currentUser.uid), {
          ...data,
          lastActive: serverTimestamp()
        }, { merge: true });
        return true;
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, userPath);
        return false;
      }
    },
    toggleWorkoutShare: async (workoutId: string) => {
      if (!currentUser) return;
      const workout = workouts.find(w => w.id === workoutId);
      if (!workout) return;
      
      const newStatus = !workout.isShared;
      try {
        await updateDoc(doc(db, 'workouts', workoutId), { isShared: newStatus });
        setWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, isShared: newStatus } : w));
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `workouts/${workoutId}`);
      }
    },
    togglePRShare: async (prId: string) => {
      if (!currentUser) return;
      const pr = manualPRs.find(p => p.id === prId);
      if (!pr) return;

      const newStatus = !pr.isShared;
      try {
        await updateDoc(doc(db, 'manual_prs', prId), { isShared: newStatus });
        setManualPRs(prev => prev.map(p => p.id === prId ? { ...p, isShared: newStatus } : p));
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `manual_prs/${prId}`);
      }
    },
    syncDataToCloud: async () => {
      if (!currentUser) return;
      const userPath = `users/${currentUser.uid}`;
      try {
        // Sync PRs
        for (const pr of manualPRs) {
          const prsQuery = query(collection(db, 'manual_prs'), where('userId', '==', currentUser.uid), where('exerciseName', '==', pr.exerciseName));
          const prsSnap = await getDocs(prsQuery);
          if (prsSnap.empty) {
            await addDoc(collection(db, 'manual_prs'), { ...pr, userId: currentUser.uid });
          }
        }
        // Sync Profile
        await setDoc(doc(db, 'users', currentUser.uid), {
          displayName: currentUser.displayName || 'Athlète',
          height: userHeight,
          volumeTargets,
          unit,
          bodyMetrics,
          lastActive: serverTimestamp()
        }, { merge: true });
        
        alert("Données locales synchronisées avec le cloud !");
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, userPath);
        alert("Erreur lors de la synchronisation.");
      }
    },
    resetData,
    exportData,
    importData,
    isLoaded,
    xp: workouts.reduce((acc, w) => acc + 100 + (w.entries.length * 20), 0) + (manualPRs?.length || 0) * 50,
    userLevel: Math.floor((workouts.reduce((acc, w) => acc + 100 + (w.entries.length * 20), 0) + (manualPRs?.length || 0) * 50) / 500) + 1
  };
}
