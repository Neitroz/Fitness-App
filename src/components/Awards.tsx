
import React, { useMemo, useState } from 'react';
import { Trophy, Medal, Award, Star, TrendingUp, Info, Plus, Edit2, Scale, Share2 } from 'lucide-react';
import { Card, Badge, Modal, Input, Button } from './UI';
import { WorkoutSession, Exercise, ManualPR } from '../types';

interface AwardsProps {
  workouts: WorkoutSession[];
  exercises: Exercise[];
  manualPRs: ManualPR[];
  bodyMetrics?: any[];
  onUpdatePR: (pr: ManualPR) => void;
  onToggleShare?: (prId: string) => void;
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
  'Développé Haltères (Épaules)': [
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
  'Haltères & Press': ['Développé Haltères (Épaules)'],
  'Poids du Corps & Calisthénie': ['Tractions', 'Dips'],
};

const MAIN_EXERCISES = Object.values(CATEGORIES).flat();

// Epley Formula: 1RM = weight * (1 + reps / 30)
const calculate1RM = (weight: number, reps: number) => {
  if (reps === 1) return weight;
  if (reps === 0) return 0;
  return weight * (1 + reps / 30);
};

export function Awards({ workouts, exercises, manualPRs, bodyMetrics = [], onUpdatePR, onToggleShare }: AwardsProps) {
  const [editingPR, setEditingPR] = useState<string | null>(null);
  const [shareConfig, setShareConfig] = useState<{ id: string, name: string, isShared: boolean } | null>(null);
  const [formData, setFormData] = useState({ weight: '', reps: '1', bodyWeight: '', isWeighted: false });

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl text-white bebas tracking-wider">Hauts Faits & Records</h1>
          <p className="text-gray-500 uppercase font-bold tracking-[0.2em] text-[10px]">Tes accomplissements et trophées de force manuels</p>
        </div>
        
        <div className="flex gap-4">
          <Card className="px-4 py-2 bg-neon/10 border-neon/20 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-neon" />
            <div>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tight">Total Trophées</p>
              <p className="text-xl text-white font-mono leading-none">{stats.totalBadges}</p>
            </div>
          </Card>
          <div className="hidden sm:flex gap-2">
            {Object.entries(stats.badgeCounts).map(([label, count]) => {
              if (count === 0) return null;
              const lvl = Object.values(BADGE_LEVELS).flatMap(v => v).find(l => l.label === label);
              return (
                <div key={label} className="flex flex-col items-center">
                  <div className="text-sm" style={{ color: lvl?.color }}>{lvl?.icon}</div>
                  <span className="text-[10px] text-white font-mono">{count}</span>
                </div>
              );
            })}
          </div>
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
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEdit(exName)}
                            className="p-1 hover:text-neon text-gray-600 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {pr && onToggleShare && (
                            <button 
                              onClick={() => setShareConfig({ id: pr.id, name: pr.exerciseName, isShared: !!pr.isShared })}
                              className={`p-1 transition-colors ${pr.isShared ? 'text-neon' : 'text-gray-600 hover:text-neon'}`}
                              title={pr.isShared ? 'Partagé' : 'Partager'}
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
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
        isOpen={!!shareConfig} 
        onClose={() => setShareConfig(null)} 
        title={shareConfig?.isShared ? "Retirer du flux" : "Partager mon Record"}
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${shareConfig?.isShared ? 'bg-red-500/10 text-red-500' : 'bg-neon/10 text-neon'}`}>
              <Share2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl text-white font-display uppercase tracking-tight">
                {shareConfig?.isShared ? "Retirer le record ?" : "Partager ton trophée !"}
              </h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                {shareConfig?.isShared 
                   ? `Ce record ne sera plus visible sur ton profil public.` 
                   : `Le record de "${shareConfig?.name}" sera publié sur le flux communautaire.`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              variant={shareConfig?.isShared ? 'danger' : 'neon'} 
              className="w-full h-12 text-sm uppercase tracking-widest font-bold"
              onClick={() => {
                if (shareConfig && onToggleShare) {
                  onToggleShare(shareConfig.id);
                  setShareConfig(null);
                }
              }}
            >
              {shareConfig?.isShared ? "Retirer maintenant" : "Publier sur le flux"}
            </Button>
            <Button 
              variant="secondary" 
              className="w-full text-[10px] uppercase tracking-widest"
              onClick={() => setShareConfig(null)}
            >
              Annuler
            </Button>
          </div>
        </div>
      </Modal>

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
