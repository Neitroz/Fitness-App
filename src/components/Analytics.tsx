import React, { useState, useMemo } from 'react';
import { WorkoutSession, Exercise } from '../types';
import { Card, Badge } from './UI';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Activity,
  Calendar as CalIcon,
  Flame
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Analytics({ 
  workouts, 
  exercises 
}: { 
  workouts: WorkoutSession[]; 
  exercises: Exercise[];
}) {
  const [selectedExId, setSelectedExId] = useState<string>(exercises[0]?.id || '');
  const [period, setPeriod] = useState<number>(180); // Default 6 months in days

  const exerciseData = useMemo(() => {
    if (!selectedExId) return [];
    
    const cutoff = subDays(new Date(), period);
    
    return workouts
      .filter(w => isAfter(new Date(w.date), cutoff))
      .map(w => {
        const entry = w.entries.find(e => e.exerciseId === selectedExId);
        if (!entry) return null;

        const maxWeight = Math.max(...entry.sets.map(s => s.weight));
        const totalVolume = entry.sets.reduce((acc, s) => acc + (s.weight * s.reps * (s.side === 'both' ? 2 : 1)), 0);
        const avgRir = entry.sets.filter(s => s.rir !== null).reduce((acc, s) => acc + (s.rir || 0), 0) / entry.sets.filter(s => s.rir !== null).length;

        return {
          date: format(new Date(w.date), 'dd/MM'),
          fullDate: w.date,
          weight: maxWeight,
          volume: totalVolume,
          rir: isNaN(avgRir) ? null : Number(avgRir.toFixed(1))
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a!.fullDate).getTime() - new Date(b!.fullDate).getTime());
  }, [selectedExId, workouts, period]);

  const muscleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    workouts.forEach(w => {
      w.entries.forEach(e => {
        const ex = exercises.find(ex => ex.id === e.exerciseId);
        if (ex) {
          (ex.muscleGroups || []).forEach(mg => {
            counts[mg] = (counts[mg] || 0) + e.sets.length;
          });
        }
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [workouts, exercises]);

  const weeklyMuscleVolume = useMemo(() => {
    const counts: Record<string, number> = {};
    const sevenDaysAgo = subDays(new Date(), 7);
    
    workouts.filter(w => isAfter(new Date(w.date), sevenDaysAgo)).forEach(w => {
      w.entries.forEach(e => {
        const ex = exercises.find(ex => ex.id === e.exerciseId);
        if (ex) {
          (ex.muscleGroups || []).forEach(mg => {
            counts[mg] = (counts[mg] || 0) + e.sets.length;
          });
        }
      });
    });

    const MUSCLE_GROUPS_LIST = [
      "Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", 
      "Quadriceps", "Ischios", "Fessiers", "Mollets", 
      "Abdominaux", "Lombaires", "Autre"
    ];

    return MUSCLE_GROUPS_LIST.map(mg => ({
      name: mg,
      sets: counts[mg] || 0,
    })).filter(m => m.sets > 0 || ["Pectoraux", "Dos", "Quadriceps", "Épaules"].includes(m.name))
       .sort((a, b) => b.sets - a.sets);
  }, [workouts, exercises]);

  const COLORS = ['#e8ff47', '#ff6b35', '#00d2ff', '#9d50bb', '#6e48aa', '#f80759'];

  const prs = useMemo(() => {
    if (exerciseData.length === 0) return null;
    const maxWeight = Math.max(...exerciseData.map(d => d!.weight));
    const maxVolume = Math.max(...exerciseData.map(d => d!.volume));
    const latestWeight = exerciseData[exerciseData.length - 1]!.weight;
    
    // 1RM Estimate (Epley): 1RM = weight * (1 + reps / 30)
    // For simplicity, we just use the max PR set
    let best1RM = 0;
    workouts.forEach(w => {
      w.entries.forEach(e => {
        if (e.exerciseId === selectedExId) {
          e.sets.forEach(s => {
            const epley = s.weight * (1 + s.reps / 30);
            if (epley > best1RM) best1RM = epley;
          });
        }
      });
    });

    return {
      weight: maxWeight,
      volume: maxVolume,
      oneRM: Math.round(best1RM),
      latest: latestWeight
    };
  }, [exerciseData, workouts, selectedExId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-4xl text-white bebas tracking-wider">Analyses</h1>

      {/* Weekly Volume Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-white font-display uppercase tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-neon" /> Volume Hebdomadaire (7j)
          </h2>
          <Badge variant="gray">Cible : 4-10 séries / muscle</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeklyMuscleVolume.map(mv => {
            const isOptimal = mv.sets >= 4 && mv.sets <= 10;
            const isLow = mv.sets < 4 && mv.sets > 0;
            const isHigh = mv.sets > 10;
            
            let statusColor = "text-gray-500";
            if (isOptimal) statusColor = "text-neon";
            if (isLow) statusColor = "text-sport-orange";
            if (isHigh) statusColor = "text-red-500";

            return (
              <Card key={mv.name} className="p-4 bg-gradient-to-br from-dark-surface to-black/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">{mv.name}</p>
                    <h4 className={`text-2xl font-mono ${statusColor}`}>{mv.sets} <span className="text-xs uppercase ml-1">Séries</span></h4>
                  </div>
                  <div className={`w-2 h-10 rounded-full bg-black/40 overflow-hidden relative`}>
                    <div 
                      className={`absolute bottom-0 left-0 w-full transition-all duration-500 ${isOptimal ? 'bg-neon shadow-[0_0_10px_rgba(232,255,11,0.5)]' : isLow ? 'bg-sport-orange' : isHigh ? 'bg-red-500' : 'bg-gray-800'}`} 
                      style={{ height: `${Math.min(mv.sets * 10, 100)}%` }} 
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 flex-1 rounded-full ${i < mv.sets ? (isOptimal ? 'bg-neon/40' : isLow ? 'bg-sport-orange/40' : 'bg-red-500/40') : 'bg-white/5'}`}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Exercise Selection */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select 
          value={selectedExId} 
          onChange={(e) => setSelectedExId(e.target.value)}
          className="bg-dark-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon/50 flex-1 font-display uppercase tracking-widest"
        >
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id} className="bg-dark-surface">{ex.name}</option>
          ))}
        </select>
        <div className="flex bg-dark-surface border border-white/10 rounded-xl p-1">
          {[30, 90, 180, 365].map(d => (
            <button 
              key={d} 
              onClick={() => setPeriod(d)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${period === d ? 'bg-neon text-black' : 'text-gray-500 hover:text-white'}`}
            >
              {d === 365 ? '1an' : d + 'j'}
            </button>
          ))}
        </div>
      </div>

      {exerciseData.length > 0 ? (
        <>
          {/* PR Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PR Poids</p>
              <p className="text-3xl text-neon font-mono">{prs?.weight}kg</p>
            </Card>
            <Card className="p-4 text-center space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Est. 1RM</p>
              <p className="text-3xl text-sport-orange font-mono">{prs?.oneRM}kg</p>
            </Card>
            <Card className="p-4 text-center space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PR Volume</p>
              <p className="text-xl text-white font-mono">{prs?.volume.toLocaleString()}kg</p>
            </Card>
            <Card className="p-4 text-center space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dernière Séance</p>
              <p className="text-3xl text-white font-mono">{prs?.latest}kg</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 h-[400px]">
              <h3 className="text-lg text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon" /> Évolution Charge Max
              </h3>
              <div className="w-full h-full pb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" vertical={false} />
                    <XAxis dataKey="date" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2d2d3d', borderRadius: '8px' }}
                      itemStyle={{ color: '#e8ff47' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#e8ff47" 
                      strokeWidth={3} 
                      dot={{ fill: '#e8ff47', strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6, stroke: '#0a0a0f', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 h-[400px]">
              <h3 className="text-lg text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sport-orange" /> Volume par Séance
              </h3>
              <div className="w-full h-full pb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" vertical={false} />
                    <XAxis dataKey="date" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2d2d3d', borderRadius: '8px' }}
                      itemStyle={{ color: '#ff6b35' }}
                    />
                    <Bar dataKey="volume" fill="#ff6b35" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="p-20 text-center flex flex-col items-center justify-center">
          <Activity className="w-12 h-12 text-gray-800 mb-4" />
          <p className="text-gray-500 font-display text-xl uppercase italic tracking-widest">Pas de données pour cette période</p>
        </Card>
      )}

      {/* Global distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg text-white mb-6 flex items-center gap-2 uppercase">
            <Target className="w-5 h-5 text-blue-500" /> Répartition par Muscles
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={muscleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {muscleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2d2d3d', borderRadius: '8px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-center items-center text-center">
            <CalIcon className="w-12 h-12 text-neon mb-4 opacity-20" />
            <h3 className="text-xl text-white bebas tracking-widest mb-1">Activité Totale</h3>
            <p className="text-4xl text-neon font-mono mb-4">{workouts.length}</p>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Séances Enregistrées</p>
            
            <div className="mt-8 grid grid-cols-2 gap-8 w-full border-t border-white/5 pt-8">
                <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Séries Totales</p>
                   <p className="text-2xl text-white font-mono">
                    {workouts.reduce((acc, w) => acc + w.entries.reduce((acc2, e) => acc2 + e.sets.length, 0), 0)}
                   </p>
                </div>
                <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Record de Séance</p>
                   <p className="text-2xl text-white font-mono">
                    {Math.max(...workouts.map(w => w.entries.reduce((acc, e) => acc + e.sets.reduce((acc2, s) => acc2 + (s.weight * s.reps), 0), 0))).toLocaleString()}kg
                   </p>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
