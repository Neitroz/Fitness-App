import React, { useMemo } from 'react';
import { Exercise, WorkoutSession, BodyMetric, ManualPR, UserStats } from '../types';
import { Card, Button, Badge } from './UI';
import { Activity, Dumbbell, Trophy, Plus, ChevronRight, Scale, TrendingUp, TrendingDown, Star, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, isWithinInterval, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getXPProgress, getRank } from '../lib/xp';

export function Dashboard({ 
  workouts, 
  exercises, 
  bodyMetrics,
  manualPRs,
  userStats,
  onStartWorkout,
  onViewChange
}: { 
  workouts: WorkoutSession[]; 
  exercises: Exercise[];
  bodyMetrics: BodyMetric[];
  manualPRs?: ManualPR[];
  userStats?: UserStats;
  onStartWorkout: () => void;
  onViewChange?: (view: string) => void;
}) {
  const xpInfo = useMemo(() => getXPProgress(userStats?.xp || 0), [userStats?.xp]);
  const rank = useMemo(() => getRank(userStats?.level || 1), [userStats?.level]);
  const last7Days = useMemo(() => {
    const now = new Date();
    const start = subDays(now, 7);
    return workouts.filter(w => w.status === 'completed' && isWithinInterval(new Date(w.date), { start, end: now }));
  }, [workouts]);

  const stats = useMemo(() => {
    const totalSets = last7Days.reduce((acc, w) => acc + w.entries.reduce((acc2, e) => {
      const ex = exercises.find(ex => ex.id === e.exerciseId);
      const setsCount = ex?.isUnilateral ? e.sets.length / 2 : e.sets.length;
      return acc2 + setsCount;
    }, 0), 0);
    const uniqueExercises = new Set(last7Days.flatMap(w => w.entries.map(e => e.exerciseId))).size;
    
    return {
      workoutsCount: last7Days.length,
      setsCount: totalSets,
      exercisesCount: uniqueExercises
    };
  }, [last7Days]);

  const lastWorkout = workouts.find(w => w.status === 'completed');

  const weightStats = useMemo(() => {
    if (!bodyMetrics || bodyMetrics.length === 0) return null;
    const sorted = [...bodyMetrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const diff = previous ? latest.weight - previous.weight : 0;
    return { latest, diff };
  }, [bodyMetrics]);

  const recentPRs = useMemo(() => {
    if (manualPRs && manualPRs.length > 0) {
      return [...manualPRs]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
    }
    // Fallback to automatic detection if no manual PRs
    if (!lastWorkout) return [];
    
    return lastWorkout.entries.map(entry => {
      const exercise = exercises.find(e => e.id === entry.exerciseId);
      const maxWeight = Math.max(...entry.sets.map(s => s.weight));
      const bestSet = entry.sets.reduce((prev, curr) => (curr.weight * curr.reps > prev.weight * prev.reps) ? curr : prev);
      
      return {
        exerciseName: exercise?.name || 'Inconnu',
        weight: bestSet.weight,
        reps: bestSet.reps,
        date: lastWorkout.date
      };
    }).slice(0, 3);
  }, [lastWorkout, exercises]);

  const frequencyData = useMemo(() => {
    const now = new Date();
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dayKey = format(date, 'yyyy-MM-dd');
      const count = workouts.filter(w => w.status === 'completed' && format(new Date(w.date), 'yyyy-MM-dd') === dayKey).length;
      data.push({
        name: format(date, 'dd/MM'),
        count,
        fullDate: dayKey
      });
    }
    return data;
  }, [workouts]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white bebas tracking-wider">Tableau de Bord</h1>
          <p className="text-gray-400 text-sm">Tes progrès des 7 derniers jours.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Card 
            className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-neon/10 to-transparent border-neon/20 shadow-[0_0_20px_rgba(232,255,11,0.05)] w-full sm:w-64 cursor-pointer hover:border-neon/40 transition-all group"
            onClick={() => onViewChange?.('awards')}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-neon flex items-center justify-center text-black font-display text-2xl italic tracking-tighter shadow-lg shadow-neon/20 group-hover:scale-110 transition-transform">
                {userStats?.level}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-sport-orange rounded-full flex items-center justify-center border-2 border-dark-bg">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Niveau Athlète</span>
                <span className="text-[10px] font-bold text-neon uppercase tracking-widest leading-none">{Math.round(xpInfo.percentage)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon transition-all duration-1000 shadow-[0_0_10px_rgba(232,255,11,0.5)]" 
                  style={{ width: `${xpInfo.percentage}%` }}
                />
              </div>
              <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">
                {xpInfo.xpToNext} XP avant le prochain palier
              </p>
            </div>
          </Card>

          <Button variant="neon" size="lg" className="gap-2 w-full sm:w-auto shadow-lg shadow-neon/10" onClick={onStartWorkout}>
            <Plus className="w-5 h-5" />
            Nouvelle Séance
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-6 bg-gradient-to-br from-dark-surface to-black/40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Séances</p>
              <h3 className="text-2xl md:text-3xl text-white font-mono">{stats.workoutsCount}</h3>
            </div>
            <div className="bg-neon/10 p-1.5 md:p-2 rounded-lg">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-neon" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-6 bg-gradient-to-br from-dark-surface to-black/40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Poids</p>
              <h3 className="text-2xl md:text-3xl text-neon font-mono">
                {weightStats ? `${weightStats.latest.weight}` : '--'} 
                <span className="text-[10px] md:text-xs text-gray-600 ml-0.5">KG</span>
              </h3>
              {weightStats && weightStats.diff !== 0 && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {weightStats.diff > 0 ? (
                    <TrendingUp className="w-2.5 h-2.5 text-red-500" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 text-green-500" />
                  )}
                  <span className={`text-[9px] font-bold ${weightStats.diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {weightStats.diff > 0 ? '+' : ''}{weightStats.diff.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            <div className="bg-neon/10 p-1.5 md:p-2 rounded-lg">
              <Scale className="w-4 h-4 md:w-5 md:h-5 text-neon" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-6 bg-gradient-to-br from-dark-surface to-black/40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Exercices</p>
              <h3 className="text-2xl md:text-3xl text-white font-mono">{stats.exercisesCount}</h3>
            </div>
            <div className="bg-sport-orange/10 p-1.5 md:p-2 rounded-lg">
              <Dumbbell className="w-4 h-4 md:w-5 md:h-5 text-sport-orange" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-6 bg-gradient-to-br from-dark-surface to-black/40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Séries</p>
              <h3 className="text-2xl md:text-3xl text-white font-mono">{stats.setsCount}</h3>
            </div>
            <div className="bg-blue-500/10 p-1.5 md:p-2 rounded-lg">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Frequency Chart */}
        <Card className="p-6 flex flex-col h-[350px]">
          <h3 className="text-lg text-white mb-6">Fréquence d'Entraînement (30j)</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2d2d3d', borderRadius: '8px' }}
                  itemStyle={{ color: '#e8ff47' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {frequencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#e8ff47' : '#1f1f2e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Last Workout / Recent PRs */}
        <div className="space-y-6">
          {lastWorkout && (
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg text-white">Dernière Séance</h3>
                <Badge variant="neon">
                  {format(new Date(lastWorkout.date), 'dd MMM yyyy', { locale: fr })}
                </Badge>
              </div>
              <div className="space-y-3">
                <p className="text-sport-orange font-display text-xl">{lastWorkout.name}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {lastWorkout.entries.map(e => {
                const ex = exercises.find(ex => ex.id === e.exerciseId);
                const setsCount = ex?.isUnilateral ? e.sets.length / 2 : e.sets.length;
                return (
                  <div key={e.id} className="flex flex-col gap-1">
                    <Badge variant="gray">
                      {ex?.name} ({setsCount} {setsCount > 1 ? 'séries' : 'série'})
                    </Badge>
                  </div>
                );
              })}
            </div>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-white">Records Récents</h3>
              <button 
                onClick={() => onViewChange?.('awards')}
                className="text-[10px] text-neon font-bold uppercase tracking-widest hover:underline"
              >
                Voir tout
              </button>
            </div>
            <div className="space-y-2">
              {recentPRs.length > 0 ? recentPRs.map((pr, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neon/10 flex items-center justify-center text-neon text-xs font-bold">
                      {pr.id ? 'REC' : 'PR'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{pr.exerciseName || (pr as any).name}</p>
                      <p className="text-xs text-gray-500">{format(new Date(pr.date), 'dd/MM/yy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-neon">{pr.weight}kg</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-tighter">× {pr.reps} reps</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-600 text-sm italic">Aucun record récent détecté.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
