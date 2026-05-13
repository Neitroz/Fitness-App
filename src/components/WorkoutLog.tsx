import React, { useState, useMemo } from 'react';
import { WorkoutSession, Exercise, Side, Set, WorkoutEntry } from '../types';
import { Card, Button, Input, Modal, Badge, cn } from './UI';
import { 
  Calendar, 
  Trash2, 
  Plus, 
  Dumbbell,
  MoreHorizontal, 
  ChevronRight, 
  Clock, 
  Database,
  ArrowBigUpDash,
  Save,
  X,
  Copy,
  CheckCircle2,
  Check,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { BodyFront, BodyBack } from './BodyHeatmap';

export function WorkoutLog({ 
  workouts, 
  exercises, 
  onAddWorkout, 
  onUpdateWorkout, 
  onDeleteWorkout,
  currentWorkout,
  setCurrentWorkout
}: { 
  workouts: WorkoutSession[]; 
  exercises: Exercise[];
  onAddWorkout: (w: WorkoutSession) => void;
  onUpdateWorkout: (w: WorkoutSession) => void;
  onDeleteWorkout: (id: string) => void;
  currentWorkout: WorkoutSession | null;
  setCurrentWorkout: (w: WorkoutSession | null) => void;
}) {
  const [isAddingEjercicio, setIsAddingEjercicio] = useState(false);
  const [searchEx, setSearchEx] = useState('');

  const currentMuscleVolume = useMemo(() => {
    if (!currentWorkout) return [];
    const counts: Record<string, number> = {};
    currentWorkout.entries.forEach(e => {
      const ex = exercises.find(ex => ex.id === e.exerciseId);
      if (ex) {
        const setsCount = ex.isUnilateral ? e.sets.length / 2 : e.sets.length;
        (ex.muscleGroups || []).forEach(mg => {
          counts[mg] = (counts[mg] || 0) + setsCount;
        });
      }
    });
    return Object.entries(counts).map(([name, sets]) => ({ name, sets }));
  }, [currentWorkout, exercises]);


  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => ex.name.toLowerCase().includes(searchEx.toLowerCase()));
  }, [exercises, searchEx]);

  const handleStartNewWorkout = () => {
    setCurrentWorkout({
      id: uuidv4(),
      date: new Date().toISOString(),
      name: `Séance du ${format(new Date(), 'dd/MM/yy')}`,
      notes: '',
      entries: []
    });
  };

  const handleCopyWorkout = (oldW: WorkoutSession) => {
    setCurrentWorkout({
      ...oldW,
      id: uuidv4(),
      date: new Date().toISOString(),
      name: `${oldW.name} (Copie)`,
      status: 'draft',
      entries: oldW.entries.map(e => ({
        ...e,
        id: uuidv4(),
        sets: e.sets.map(s => ({ ...s, id: uuidv4() }))
      }))
    });
  };

  const toggleWorkoutStatus = (e: React.MouseEvent, workout: WorkoutSession) => {
    e.stopPropagation();
    onUpdateWorkout({
      ...workout,
      status: workout.status === 'completed' ? 'draft' : 'completed'
    });
  };

  const addExerciseToWorkout = (ex: Exercise) => {
    if (!currentWorkout) return;
    
    // Check if last set exists for this exercise to pre-fill
    // (Ideally we would look through historical data, but let's keep it simple for now within the same session or empty)
    
    const newEntry: WorkoutEntry = {
      id: uuidv4(),
      exerciseId: ex.id,
      sets: [
        { 
          id: uuidv4(), 
          setNumber: 1, 
          weight: 0, 
          unit: 'kg', 
          reps: 10, 
          rir: null, 
          side: 'both' 
        }
      ]
    };

    setCurrentWorkout({
      ...currentWorkout,
      entries: [...currentWorkout.entries, newEntry]
    });
    setIsAddingEjercicio(false);
  };

  const updateSet = (entryId: string, setId: string, updates: Partial<Set>) => {
    if (!currentWorkout) return;
    setCurrentWorkout({
      ...currentWorkout,
      entries: currentWorkout.entries.map(e => {
        if (e.id !== entryId) return e;
        return {
          ...e,
          sets: e.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
        };
      })
    });
  };

  const addSet = (entryId: string) => {
    if (!currentWorkout) return;
    setCurrentWorkout({
      ...currentWorkout,
      entries: currentWorkout.entries.map(e => {
        if (e.id !== entryId) return e;
        const lastSet = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [...e.sets, {
            id: uuidv4(),
            setNumber: e.sets.length + 1,
            weight: lastSet?.weight || 0,
            unit: lastSet?.unit || 'kg',
            reps: lastSet?.reps || 10,
            rir: lastSet?.rir || null,
            side: lastSet?.side || 'both'
          }]
        };
      })
    });
  };

  const removeSet = (entryId: string, setId: string) => {
    if (!currentWorkout) return;
    setCurrentWorkout({
      ...currentWorkout,
      entries: currentWorkout.entries.map(e => {
        if (e.id !== entryId) return e;
        return {
          ...e,
          sets: e.sets.filter(s => s.id !== setId).map((s, i) => ({ ...s, setNumber: i + 1 }))
        };
      })
    });
  };

  const removeEntry = (entryId: string) => {
    if (!currentWorkout) return;
    setCurrentWorkout({
      ...currentWorkout,
      entries: currentWorkout.entries.filter(e => e.id !== entryId)
    });
  };

  const saveWorkout = (completed = false) => {
    if (!currentWorkout) return;
    const finalWorkout = { 
      ...currentWorkout, 
      status: completed ? 'completed' as const : (currentWorkout.status || 'draft' as const) 
    };
    const isExisting = workouts.find(w => w.id === finalWorkout.id);
    if (isExisting) {
      onUpdateWorkout(finalWorkout);
    } else {
      onAddWorkout(finalWorkout);
    }
    setCurrentWorkout(null);
  };

  if (currentWorkout) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500 pb-20">
        <div className="flex justify-between items-center bg-black/40 p-4 -mx-4 md:mx-0 md:rounded-xl border-y md:border border-white/10 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentWorkout(null)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl text-white font-display">Modifier Séance</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 px-3 sm:px-4" onClick={() => saveWorkout(false)}>
              <Save className="w-4 h-4" /> 
              <span className="hidden sm:inline">Sauvegarder</span>
            </Button>
            <Button variant="neon" size="sm" className="gap-2 px-3 sm:px-4" onClick={() => saveWorkout(true)}>
              <CheckCircle2 className="w-4 h-4" /> 
              <span className="hidden sm:inline">Finir la séance</span>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nom de la séance"
              value={currentWorkout.name} 
              onChange={(e) => setCurrentWorkout({ ...currentWorkout, name: e.target.value })} 
              placeholder="Ex: Pecs & Triceps"
            />
            <Input 
              label="Date de l'entraînement"
              type="date"
              value={format(new Date(currentWorkout.date), 'yyyy-MM-dd')}
              onChange={(e) => setCurrentWorkout({ ...currentWorkout, date: new Date(e.target.value).toISOString() })} 
            />
          </div>

          <div className="space-y-4">
            {currentWorkout.entries.map((entry) => {
              const exercise = exercises.find(ex => ex.id === entry.exerciseId);
              
              // Find previous performance for this exercise
              const previousWorkout = workouts.find(w => 
                w.id !== currentWorkout.id && 
                new Date(w.date) < new Date(currentWorkout.date) &&
                w.entries.some(e => e.exerciseId === entry.exerciseId)
              );
              const previousEntry = previousWorkout?.entries.find(e => e.exerciseId === entry.exerciseId);
              
              const lastSetLeft = exercise?.isUnilateral ? previousEntry?.sets.find(s => s.side === 'left') : null;
              const lastSetRight = exercise?.isUnilateral ? previousEntry?.sets.find(s => s.side === 'right') : null;
              const lastSetBoth = !exercise?.isUnilateral ? previousEntry?.sets[0] : null;

              return (
                <Card key={entry.id} className="border-l-4 border-l-sport-orange">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-sport-orange" />
                        <div>
                          <h4 className="text-lg text-white font-display uppercase leading-none">{exercise?.name}</h4>
                          <div className="flex gap-1 mt-1">
                            {(exercise?.muscleGroups || []).map(mg => (
                              <span key={mg} className="text-[8px] text-gray-500 uppercase font-bold">{mg}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeEntry(entry.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {(lastSetBoth || lastSetLeft || lastSetRight) && (
                      <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col gap-1">
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Dernière fois:</span>
                        <div className="flex gap-4">
                          {lastSetBoth && <span className="text-xs font-mono text-neon">{lastSetBoth.weight}kg × {lastSetBoth.reps}</span>}
                          {lastSetLeft && <span className="text-xs font-mono text-sport-orange">G: {lastSetLeft.weight}kg × {lastSetLeft.reps}</span>}
                          {lastSetRight && <span className="text-xs font-mono text-blue-400">D: {lastSetRight.weight}kg × {lastSetRight.reps}</span>}
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-white/5">
                            <th className="px-4 py-2 w-12 text-center">N°</th>
                            <th className="px-4 py-2 min-w-[80px]">Poids</th>
                            <th className="px-4 py-2 min-w-[80px]">Reps</th>
                            <th className="px-4 py-2 min-w-[100px]">RIR</th>
                            {exercise?.isUnilateral && <th className="px-4 py-2">Côté</th>}
                            <th className="px-4 py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {entry.sets.map((set) => (
                            <tr key={set.id}>
                              <td className="px-4 py-3 text-center">
                                <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-gray-400">
                                  {set.setNumber}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="number" 
                                    placeholder="Charge (kg)"
                                    value={set.weight === 0 ? '' : set.weight} 
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => updateSet(entry.id, set.id, { weight: parseFloat(e.target.value) || 0 })}
                                    className="w-20 bg-black/40 border border-white/5 rounded px-2 py-1 text-sm text-center font-mono placeholder:text-[10px] placeholder:text-gray-700"
                                  />
                                  <span className="text-[10px] text-gray-500 uppercase">kg</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="number" 
                                  placeholder="Reps"
                                  value={set.reps === 0 ? '' : set.reps} 
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => updateSet(entry.id, set.id, { reps: parseInt(e.target.value) || 0 })}
                                  className="w-14 bg-black/40 border border-white/5 rounded px-2 py-1 text-sm text-center font-mono placeholder:text-[10px] placeholder:text-gray-700"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  {[0, 1, 2, 3].map(v => (
                                    <button
                                      key={v}
                                      onClick={() => updateSet(entry.id, set.id, { rir: v === set.rir ? null : v })}
                                      className={cn(
                                        "w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold transition-all",
                                        v === set.rir 
                                          ? (v === 0 ? "bg-red-500 text-white" : "bg-neon text-black") 
                                          : "bg-white/5 text-gray-500 hover:bg-white/10"
                                      )}
                                    >
                                      {v}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              {exercise?.isUnilateral && (
                                <td className="px-4 py-3">
                                  <select 
                                    value={set.side}
                                    onChange={(e) => updateSet(entry.id, set.id, { side: e.target.value as Side })}
                                    className="bg-black/40 border border-white/5 rounded px-1 py-1 text-[10px] text-gray-400 focus:outline-none"
                                  >
                                    <option value="both">Les deux</option>
                                    <option value="left">Gauche</option>
                                    <option value="right">Droite</option>
                                  </select>
                                </td>
                              )}
                              <td className="px-4 py-3">
                                <button onClick={() => removeSet(entry.id, set.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => addSet(entry.id)}>
                      <Plus className="w-4 h-4 mr-2" /> Ajouter une série
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button variant="secondary" className="w-full border-dashed text-neon hover:border-neon/50" onClick={() => setIsAddingEjercicio(true)}>
            <Plus className="w-5 h-5 mr-2" /> Ajouter un exercice
          </Button>

          <div className="space-y-1 pt-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Notes de séance</label>
            <textarea 
              value={currentWorkout.notes} 
              onChange={(e) => setCurrentWorkout({ ...currentWorkout, notes: e.target.value })} 
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 transition-all font-sans min-h-[100px]"
              placeholder="Comment s'est passée la séance ?"
            />
          </div>

          {/* Real-time Heatmap */}
          <Card className="p-6 mt-8">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon" />
                <h3 className="text-lg text-white font-display uppercase">Groupes sollicités</h3>
              </div>
              <Badge variant="neon" className="animate-pulse">Temps Réel</Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Face</p>
                <div className="w-32 h-56">
                  <BodyFront volumeData={currentMuscleVolume} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Dos</p>
                <div className="w-32 h-56">
                  <BodyBack volumeData={currentMuscleVolume} />
                </div>
              </div>

              {/* Summary List */}
              <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2 w-full sm:w-40 h-fit">
                {currentMuscleVolume.length > 0 ? (
                  currentMuscleVolume.sort((a,b) => b.sets - a.sets).slice(0, 5).map(mv => (
                    <div key={mv.name} className="flex justify-between items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase truncate">{mv.name}</span>
                      <span className="text-[10px] text-neon font-mono">{mv.sets}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest">Aucun muscle sollicité</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Modal isOpen={isAddingEjercicio} onClose={() => setIsAddingEjercicio(false)} title="Sélectionner un exercice">
          <div className="space-y-4">
            <Input 
              placeholder="Rechercher..." 
              value={searchEx} 
              onChange={(e) => setSearchEx(e.target.value)} 
              autoFocus
            />
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredExercises.map(ex => (
                <button 
                  key={ex.id} 
                  onClick={() => addExerciseToWorkout(ex)}
                  className="w-full p-4 flex items-center justify-between bg-black/20 hover:bg-neon/10 rounded-xl border border-white/5 transition-all text-left group"
                >
                  <span className="text-white group-hover:text-neon transition-colors font-display text-lg uppercase">{ex.name}</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {(ex.muscleGroups || []).slice(0, 2).map(mg => (
                      <Badge key={mg} variant="gray" className="text-[8px]">{mg}</Badge>
                    ))}
                  </div>
                </button>
              ))}
              {filteredExercises.length === 0 && (
                <p className="text-center text-gray-500 py-4 italic">Aucun exercice trouvé.</p>
              )}
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl text-white bebas tracking-wider">Séances</h1>
        <Button variant="neon" className="gap-2" onClick={handleStartNewWorkout}>
          <Plus className="w-5 h-5" />
          Nouvelle Séance
        </Button>
      </div>

      <div className="space-y-4">
        {workouts.map(w => {
          const volume = w.entries.reduce((acc, e) => {
            const ex = exercises.find(ex => ex.id === e.exerciseId);
            return acc + e.sets.reduce((acc2, s) => acc2 + (s.weight * s.reps * (s.side === 'both' ? 2 : 1)), 0);
          }, 0);

          const totalEffectiveSets = w.entries.reduce((acc, e) => {
            const ex = exercises.find(ex => ex.id === e.exerciseId);
            const setsCount = ex?.isUnilateral ? e.sets.length / 2 : e.sets.length;
            return acc + setsCount;
          }, 0);

          return (
            <Card 
              key={w.id} 
              className="group hover:border-neon/20 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => setCurrentWorkout(w)}
            >
              {w.status === 'completed' && (
                <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center translate-x-4 -translate-y-4 rotate-45 bg-neon/10 border-b border-neon/30">
                  <Check className="w-3 h-3 text-neon -rotate-45 translate-y-2 -translate-x-2" />
                </div>
              )}
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sport-orange" />
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      {format(new Date(w.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                      {w.status === 'completed' && (
                        <Badge variant="neon" className="py-0 h-4 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Validée
                        </Badge>
                      )}
                    </span>
                  </div>
                  <h3 className="text-2xl text-white font-display uppercase group-hover:text-neon transition-colors">{w.name}</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="gray">{w.entries.length} Exercices</Badge>
                    <Badge variant="gray">{totalEffectiveSets} {totalEffectiveSets > 1 ? 'Séries' : 'Série'}</Badge>
                    <Badge variant="gray">{volume.toLocaleString()}kg Volume</Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => toggleWorkoutStatus(e, w)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      w.status === 'completed' 
                        ? "bg-neon/10 text-neon border border-neon/30" 
                        : "bg-white/5 text-gray-600 border border-white/5 hover:border-gray-500"
                    )}
                    title={w.status === 'completed' ? 'Marquer comme brouillon' : 'Valider la séance'}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <Button variant="secondary" size="sm" className="gap-2" onClick={() => handleCopyWorkout(w)}>
                    <Copy className="w-4 h-4" /> Copier
                  </Button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      if(confirm('Supprimer cette séance ?')) onDeleteWorkout(w.id); 
                    }}
                    className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
        {workouts.length === 0 && (
          <div className="text-center py-20 bg-dark-surface rounded-2xl border border-dashed border-white/10">
            <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 italic">Historique vide. Commencez une séance !</p>
          </div>
        )}
      </div>
    </div>
  );
}

