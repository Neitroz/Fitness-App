
import React, { useMemo, useState } from 'react';
import { Trophy, Medal, Award, Star, TrendingUp, Info, Plus, Edit2, Scale, Zap, ShieldCheck, Activity } from 'lucide-react';
import { Card, Badge, Modal, Input, Button } from './UI';
import { WorkoutSession, Exercise, ManualPR, UserStats } from '../types';
import { getXPProgress, getRank } from '../lib/xp';

interface AwardsProps {
  workouts: WorkoutSession[];
  exercises: Exercise[];
  manualPRs: ManualPR[];
  bodyMetrics?: any[];
  userStats?: UserStats;
  onUpdatePR: (pr: ManualPR) => void;
}

interface BadgeLevel {
  label: string;
  threshold: number;
  color: string;
  icon: React.ReactNode;
}

const BADGE_LEVELS: Record<string, BadgeLevel[]> = {
  'Développé couché': [
    { label: 'Bronze', threshold: 60, color: '#cd7f32', icon: <Medal className="w-6 h-6" /> },
    { label: 'Argent', threshold: 80, color: '#c0c0c0', icon: <Medal className="w-6 h-6" /> },
    { label: 'Or', threshold: 100, color: '#ffd700', icon: <Medal className="w-6 h-6" /> },
    { label: 'Platine', threshold: 120, color: '#e5e4e2', icon: <Trophy className="w-6 h-6" /> },
    { label: 'Diamant', threshold: 140, color: '#b9f2ff', icon: <Trophy className="w-6 h-6" /> },
  ],
  'Squat': [
    { label: 'Bronze', threshold: 80, color: '#cd7f32', icon: <Medal className="w-6 h-6" /> },
    { label: 'Argent', threshold: 100, color: '#c0c0c0', icon: <Medal className="w-6 h-6" /> },
    { label: 'Or', threshold: 125, color: '#ffd700', icon: <Medal className="w-6 h-6" /> },
    { label: 'Platine', threshold: 150, color: '#e5e4e2', icon: <Trophy className="w-6 h-6" /> },
    { label: 'Diamant', threshold: 180, color: '#b9f2ff', icon: <Trophy className="w-6 h-6" /> },
  ],
  'Soulevé de terre': [
    { label: 'Bronze', threshold: 100, color: '#cd7f32', icon: <Medal className="w-6 h-6" /> },
    { label: 'Argent', threshold: 140, color: '#c0c0c0', icon: <Medal className="w-6 h-6" /> },
    { label: 'Or', threshold: 180, color: '#ffd700', icon: <Medal className="w-6 h-6" /> },
    { label: 'Platine', threshold: 220, color: '#e5e4e2', icon: <Trophy className="w-6 h-6" /> },
    { label: 'Diamant', threshold: 260, color: '#b9f2ff', icon: <Trophy className="w-6 h-6" /> },
  ],
  'Développé Haltères': [
    { label: 'Bronze', threshold: 20, color: '#cd7f32', icon: <Medal className="w-6 h-6" /> },
    { label: 'Argent', threshold: 30, color: '#c0c0c0', icon: <Medal className="w-6 h-6" /> },
    { label: 'Or', threshold: 40, color: '#ffd700', icon: <Medal className="w-6 h-6" /> },
    { label: 'Platine', threshold: 50, color: '#e5e4e2', icon: <Trophy className="w-6 h-6" /> },
    { label: 'Diamant', threshold: 60, color: '#b9f2ff', icon: <Trophy className="w-6 h-6" /> },
  ],
  'Tractions': [
    { label: 'Bronze', threshold: 5, color: '#cd7f32', icon: <Star className="w-6 h-6" /> },
    { label: 'Argent', threshold: 12, color: '#c0c0c0', icon: <Star className="w-6 h-6" /> },
    { label: 'Or', threshold: 20, color: '#ffd700', icon: <Star className="w-6 h-6" /> },
    { label: 'Platine', threshold: 30, color: '#e5e4e2', icon: <Award className="w-6 h-6" /> },
    { label: 'Diamant', threshold: 40, color: '#b9f2ff', icon: <Award className="w-6 h-6" /> },
  ],
  'Dips': [
    { label: 'Bronze', threshold: 8, color: '#cd7f32', icon: <Star className="w-6 h-6" /> },
    { label: 'Argent', threshold: 15, color: '#c0c0c0', icon: <Star className="w-6 h-6" /> },
    { label: 'Or', threshold: 25, color: '#ffd700', icon: <Star className="w-6 h-6" /> },
    { label: 'Platine', threshold: 40, color: '#e5e4e2', icon: <Award className="w-6 h-6" /> },
    { label: 'Diamant', threshold: 50, color: '#b9f2ff', icon: <Award className="w-6 h-6" /> },
  ],
};

const WEIGHTED_BADGE_LEVELS: Record<string, BadgeLevel[]> = {
  'Tractions': [
    { label: 'Bronze', threshold: 85, color: '#cd7f32', icon: <Medal className="w-6 h-6" /> }, // total weight (BW + Extra)
    { label: 'Argent', threshold: 100, color: '#c0c0c0', icon: <Medal className="w-6 h-6" /> },
    { label: 'Or', threshold: 120, color: '#ffd700', icon: <Medal className="w-6 h-6" /> },
    { label: 'Platine', threshold: 140, color: '#e5e4e2', icon: <Trophy className="w-6 h-6" /> },
    { label: 'Diamant', threshold: 160, color: '#b9f2ff', icon: <Trophy className="w-6 h-6" /> },
  ],
  'Dips': [
    { label: 'Bronze', threshold: 90, color: '#cd7f32', icon: <Medal className="w-6 h-6" /> },
    { label: 'Argent', threshold: 110, color: '#c0c0c0', icon: <Medal className="w-6 h-6" /> },
    { label: 'Or', threshold: 140, color: '#ffd700', icon: <Medal className="w-6 h-6" /> },
    { label: 'Platine', threshold: 170, color: '#e5e4e2', icon: <Trophy className="w-6 h-6" /> },
    { label: 'Diamant', threshold: 200, color: '#b9f2ff', icon: <Trophy className="w-6 h-6" /> },
  ],
};

const CATEGORIES = {
  'Force Fondamentale': ['Développé couché', 'Squat', 'Soulevé de terre'],
  'Haltères & Press': ['Développé Haltères'],
  'Poids du Corps & Calisthénie': ['Tractions', 'Dips'],
};

const MAIN_EXERCISES = Object.values(CATEGORIES).flat();

// Epley Formula: 1RM = weight * (1 + reps / 30)
const calculate1RM = (weight: number, reps: number) => {
  if (reps === 1) return weight;
  if (reps === 0) return 0;
  return weight * (1 + reps / 30);
};

export function Awards({ workouts, exercises, manualPRs, bodyMetrics = [], userStats, onUpdatePR }: AwardsProps) {
  const [editingPR, setEditingPR] = useState<string | null>(null);
  const [formData, setFormData] = useState({ weight: '', reps: '1', bodyWeight: '', isWeighted: false });

  const xpInfo = useMemo(() => getXPProgress(userStats?.xp || 0), [userStats?.xp]);
  const rank = useMemo(() => getRank(userStats?.level || 1), [userStats?.level]);

  const latestWeight = useMemo(() => {
    if (!bodyMetrics.length) return 80;
    return [...bodyMetrics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].weight;
  }, [bodyMetrics]);

  const stats = useMemo(() => {
    let totalBadges = 0;
    const badgeCounts: Record<string, number> = { Bronze: 0, Argent: 0, Or: 0, Platine: 0, Diamant: 0 };
    
    MAIN_EXERCISES.forEach(exName => {
      const pr = manualPRs.find(p => p.exerciseName === exName);
      if (pr) {
        const isBodyweightType = exName === 'Tractions' || exName === 'Dips';
        let val = pr.weight;
        let levels = BADGE_LEVELS[exName];

        if (isBodyweightType) {
          if (pr.isWeighted) {
             val = calculate1RM(pr.weight + (pr.bodyWeight || 80), pr.reps);
             levels = WEIGHTED_BADGE_LEVELS[exName];
          } else {
             val = pr.reps;
             levels = BADGE_LEVELS[exName];
          }
        } else {
          val = calculate1RM(pr.weight, pr.reps);
          levels = BADGE_LEVELS[exName];
        }

        const achieved = levels.filter(lvl => val >= lvl.threshold);
        if (achieved.length > 0) {
          totalBadges++;
          const highest = achieved[achieved.length - 1].label;
          badgeCounts[highest]++;
        }
      }
    });

    return { totalBadges, badgeCounts };
  }, [manualPRs]);

  const handleEdit = (exName: string) => {
    const pr = manualPRs.find(p => p.exerciseName === exName);
    setEditingPR(exName);
    setFormData({
      weight: pr ? pr.weight.toString() : '',
      reps: pr ? pr.reps.toString() : '1',
      bodyWeight: pr?.bodyWeight?.toString() || latestWeight.toString(),
      isWeighted: pr?.isWeighted || false
    });
  };

  const handleSave = () => {
    if (!editingPR) return;
    onUpdatePR({
      id: editingPR,
      exerciseName: editingPR,
      weight: parseFloat(formData.weight) || 0,
      reps: parseInt(formData.reps) || 1,
      bodyWeight: parseFloat(formData.bodyWeight) || latestWeight,
      date: new Date().toISOString(),
      isWeighted: formData.isWeighted
    });
    setEditingPR(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-dark-surface to-black/60 relative overflow-hidden group border-neon/10">
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy size={300} />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-dark-bg border-2 border-white/5 flex items-center justify-center p-4">
                <div 
                  className="w-full h-full flex items-center justify-center animate-pulse"
                  style={{ color: rank.color }}
                >
                  <ShieldCheck size={80} strokeWidth={1.5} />
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-neon px-4 py-1 rounded-full shadow-xl shadow-neon/20">
                <span className="text-black font-display text-sm italic uppercase tracking-widest leading-none">NIV. {userStats?.level}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rang Actuel</span>
                  <h3 className="text-3xl text-white bebas tracking-wider" style={{ color: rank.color }}>
                    PROFIL {rank.label}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Score Total</span>
                  <p className="text-xl text-white font-mono">{userStats?.xp.toLocaleString()} <span className="text-neon text-xs">XP</span></p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Progression du palier</span>
                  <span className="text-neon">{Math.round(xpInfo.percentage)}%</span>
                </div>
                <div className="h-3 w-full bg-black/40 rounded-full p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-neon rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(232,255,11,0.3)]"
                    style={{ width: `${xpInfo.percentage}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] italic">
                  Encore {xpInfo.xpToNext} XP pour atteindre le niveau {userStats!.level + 1}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card className="px-6 py-4 bg-neon/10 border-neon/20 flex items-center gap-4">
            <div className="w-10 h-10 bg-neon rounded-lg flex items-center justify-center shadow-lg shadow-neon/20">
              <Activity className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">Séances Totales</p>
              <p className="text-2xl text-white bebas tracking-wider leading-none">{userStats?.totalWorkouts}</p>
            </div>
          </Card>
          
          <Card className="px-6 py-4 bg-sport-orange/10 border-sport-orange/20 flex items-center gap-4">
            <div className="w-10 h-10 bg-sport-orange rounded-lg flex items-center justify-center shadow-lg shadow-sport-orange/20">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">Série Actuelle</p>
              <p className="text-2xl text-white bebas tracking-wider leading-none">{userStats?.streak} Jours</p>
            </div>
          </Card>

          <Card className="px-6 py-4 bg-blue-500/10 border-blue-500/20 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">Total Trophées</p>
              <p className="text-2xl text-white bebas tracking-wider leading-none">{stats.totalBadges}</p>
            </div>
          </Card>
        </div>
      </div>

      {Object.entries(CATEGORIES).map(([catName, exNames]) => (
        <div key={catName} className="space-y-6">
          <div className="flex items-center gap-3 border-l-2 border-neon pl-4">
            <h2 className="text-2xl text-white bebas tracking-wider italic uppercase">{catName}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exNames.map((exName) => {
              const pr = manualPRs.find(p => p.exerciseName === exName);
              const isBodyweightType = exName === 'Tractions' || exName === 'Dips';
              
              let levels = (isBodyweightType && pr?.isWeighted) ? WEIGHTED_BADGE_LEVELS[exName] : BADGE_LEVELS[exName];
              let currentVal = 0;
              let displayText = 'Aucun';

              if (pr) {
                if (isBodyweightType) {
                   if (pr.isWeighted) {
                      currentVal = calculate1RM(pr.weight + (pr.bodyWeight || 80), pr.reps);
                      displayText = `${pr.weight}kg + ${pr.bodyWeight || 'PDC'} (${pr.reps} reps) ≈ ${Math.round(currentVal)}kg 1RM`;
                   } else {
                      currentVal = pr.reps;
                      displayText = `${pr.reps} reps (PDC${pr.bodyWeight ? ` @ ${pr.bodyWeight}kg` : ''})`;
                   }
                } else {
                   currentVal = calculate1RM(pr.weight, pr.reps);
                   displayText = `${pr.weight}kg x ${pr.reps} reps ≈ ${Math.round(currentVal)}kg 1RM`;
                }
              }

              const currentLevelIndex = levels.findIndex(lvl => currentVal < lvl.threshold);
              const nextLevel = currentLevelIndex === -1 ? null : levels[currentLevelIndex];
              const achievedLevels = levels.filter(lvl => currentVal >= lvl.threshold);
              const highestAchieved = achievedLevels[achievedLevels.length - 1];

              return (
                <Card key={exName} className="p-6 relative overflow-hidden group">
                  {highestAchieved && (
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                       {React.cloneElement(highestAchieved.icon as React.ReactElement, { size: 120 })}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl text-white font-display uppercase italic tracking-tight">{exName}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">
                          {displayText}
                        </p>
                        <button 
                          onClick={() => handleEdit(exName)}
                          className="p-1 hover:text-neon text-gray-600 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {highestAchieved ? (
                      <div 
                        className="flex items-center gap-2 px-3 py-1 rounded-full border"
                        style={{ borderColor: highestAchieved.color + '40', backgroundColor: highestAchieved.color + '10' }}
                      >
                        <div style={{ color: highestAchieved.color }}>{highestAchieved.icon}</div>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: highestAchieved.color }}>
                          {highestAchieved.label}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="gray">Non classé</Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest mb-1">
                      <span className="text-gray-500">Intensité Estimée</span>
                      <span className="text-neon">
                        {nextLevel ? `Prochain : ${nextLevel.threshold}${(!pr?.isWeighted && isBodyweightType) ? ' reps' : 'kg'}` : 'Niveau MAX'}
                      </span>
                    </div>
                    
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      {nextLevel ? (
                        <div 
                          className="h-full bg-neon shadow-[0_0_10px_rgba(232,255,11,0.5)] transition-all duration-1000"
                          style={{ 
                            width: `${Math.min(100, (currentVal / nextLevel.threshold) * 100)}%` 
                          }}
                        />
                      ) : (
                        <div className="h-full bg-neon w-full shadow-[0_0_10px_rgba(232,255,11,0.5)]" />
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {levels.map((lvl, idx) => {
                        const isAchieved = currentVal >= lvl.threshold;
                        return (
                          <div 
                            key={idx}
                            className={`flex-1 h-1 rounded-full transition-all duration-500 ${isAchieved ? '' : 'opacity-20'}`}
                            style={{ backgroundColor: lvl.color }}
                            title={`${lvl.label}: ${lvl.threshold}${(!pr?.isWeighted && isBodyweightType) ? ' reps' : 'kg'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <Card className="p-6 bg-black/40 border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-5 h-5 text-neon" />
          <h3 className="text-lg text-white font-display uppercase tracking-tight">Calcul des niveaux</h3>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed italic">
          Entre tes records personnels (PR) manuellement. Si tu effectues plusieurs répétitions, ton 1RM (Maximum sur 1 rép) est estimé selon la formule d'Epley. 
          Pour les tractions et dips, tu peux choisir entre le nombre de répétitions au poids du corps ou ton poids lesté total estimé (Base 80kg + Lest).
        </p>
      </Card>

      <Modal 
        isOpen={editingPR !== null} 
        onClose={() => setEditingPR(null)} 
        title={`Modifier PR : ${editingPR}`}
      >
        <div className="space-y-6">
          {(editingPR === 'Tractions' || editingPR === 'Dips') && (
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/5">
                 <button 
                  onClick={() => setFormData(f => ({ ...f, isWeighted: false }))}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${!formData.isWeighted ? 'bg-neon text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                 >
                   Poids du corps
                 </button>
                 <button 
                  onClick={() => setFormData(f => ({ ...f, isWeighted: true }))}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${formData.isWeighted ? 'bg-neon text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                 >
                   Lesté
                 </button>
              </div>

              <Input 
                label="Ton poids de corps lors du record (kg)"
                type="number"
                value={formData.bodyWeight}
                onChange={(e) => setFormData(f => ({ ...f, bodyWeight: e.target.value }))}
                placeholder="Ex: 75"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {(!isBodyweightType(editingPR!) || formData.isWeighted) && (
              <Input 
                label={editingPR === 'Développé Haltères' ? "Poids par haltère (kg)" : "Charge soulevée (kg)"}
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(f => ({ ...f, weight: e.target.value }))}
                placeholder="Ex: 100"
                autoFocus
              />
            )}
            <Input 
              label="Nombre de répétitions"
              type="number"
              value={formData.reps}
              onChange={(e) => setFormData(f => ({ ...f, reps: e.target.value }))}
              placeholder="Ex: 8"
            />
          </div>

          <div className="bg-neon/5 p-4 rounded-xl border border-neon/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-neon" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estimation 1RM</span>
            </div>
            <span className="text-xl text-white font-display italic">
              {calculate1RMValue(formData, editingPR!)} {(!isBodyweightType(editingPR!) || formData.isWeighted) ? 'kg' : 'reps'}
            </span>
          </div>

          <Button variant="neon" className="w-full" onClick={handleSave}>
            Enregistrer le record
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function isBodyweightType(exName: string) {
  return exName === 'Tractions' || exName === 'Dips';
}

function calculate1RMValue(formData: any, exName: string) {
  const w = parseFloat(formData.weight) || 0;
  const r = parseInt(formData.reps) || 0;
  const bw = parseFloat(formData.bodyWeight) || 80;
  if (isBodyweightType(exName) && !formData.isWeighted) {
    return r;
  }
  const totalW = (isBodyweightType(exName) && formData.isWeighted) ? w + bw : w;
  return Math.round(calculate1RM(totalW, r));
}
