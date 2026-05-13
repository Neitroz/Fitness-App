/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWorkoutStore } from './hooks/useWorkoutStore';
import { Dashboard } from './components/Dashboard';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutLog } from './components/WorkoutLog';
import { Analytics } from './components/Analytics';
import { Awards } from './components/Awards';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { Community } from './components/Community';
import { Button, Card, Modal, Input, Badge } from './components/UI';
import { 
  LayoutDashboard, 
  Dumbbell, 
  ClipboardList, 
  BarChart3, 
  Trophy,
  User,
  Users,
  ShieldCheck,
  Settings, 
  Download, 
  Upload, 
  Trash2,
  Menu,
  X,
  Lock
} from 'lucide-react';
import { Exercise } from './types';

type View = 'dashboard' | 'exercises' | 'workouts' | 'analytics' | 'awards' | 'profile' | 'community' | 'settings';

export default function App() {
  const store = useWorkoutStore();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);

  if (!store.isLoaded || store.isAuthLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neon font-display text-xl uppercase tracking-widest animate-pulse">Synchronisation...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard' as View, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'exercises' as View, label: 'Exercices', icon: Dumbbell },
    { id: 'workouts' as View, label: 'Séances', icon: ClipboardList },
    { id: 'awards' as View, label: 'Records & Badges', icon: Trophy },
    { id: 'community' as View, label: 'Communauté', icon: Users },
    { id: 'profile' as View, label: 'Profil & Auth', icon: User },
    { id: 'analytics' as View, label: 'Analyses', icon: BarChart3 },
    { id: 'settings' as View, label: 'Paramètres', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            workouts={store.workouts} 
            exercises={store.exercises} 
            bodyMetrics={store.bodyMetrics}
            manualPRs={store.manualPRs}
            onStartWorkout={() => setCurrentView('workouts')}
            onViewChange={(view: any) => setCurrentView(view)}
          />
        );
      case 'exercises':
        return (
          <ExerciseLibrary 
            exercises={store.exercises}
            onAdd={store.addExercise}
            onUpdate={store.updateExercise}
            onDelete={store.deleteExercise}
            onViewDetails={(ex) => {
              setSelectedExercise(ex);
              // In a more complete app, we'd go to exercise details view
            }}
          />
        );
      case 'workouts':
        return (
          <WorkoutLog 
            workouts={store.workouts} 
            exercises={store.exercises}
            onAddWorkout={store.addWorkout}
            onUpdateWorkout={store.updateWorkout}
            onDeleteWorkout={store.deleteWorkout}
            currentWorkout={currentWorkout}
            setCurrentWorkout={setCurrentWorkout}
            onToggleShare={store.toggleWorkoutShare}
          />
        );
      case 'analytics':
        return (
          <Analytics 
            workouts={store.workouts} 
            exercises={store.exercises} 
            volumeTargets={store.volumeTargets}
            onUpdateVolumeTarget={store.updateVolumeTarget}
          />
        );
      case 'awards':
        return (
          <Awards 
            workouts={store.workouts} 
            exercises={store.exercises}
            manualPRs={store.manualPRs}
            bodyMetrics={store.bodyMetrics}
            onUpdatePR={store.updateManualPR}
            onToggleShare={store.togglePRShare}
          />
        );
      case 'profile':
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-4xl text-white bebas tracking-wider italic">Mon Profil & Identité</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Auth user={store.currentUser} />
              </div>
              <div className="lg:col-span-2">
                <Profile 
                  bodyMetrics={store.bodyMetrics}
                  userHeight={store.userHeight}
                  onUpdateHeight={store.setUserHeight}
                  onAddMetric={store.addBodyMetric}
                  onDeleteMetric={store.deleteBodyMetric}
                  onUpdateProfile={store.updateProfile}
                  currentUser={store.currentUser}
                />
              </div>
            </div>
          </div>
        );
      case 'community':
        if (!store.currentUser) {
          return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Lock className="w-8 h-8 text-gray-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl text-white font-display italic uppercase">Contenu Privé</h3>
                <p className="text-sm text-gray-500 max-w-xs">Connecte-toi pour rejoindre la meute et voir les records des autres athlètes.</p>
              </div>
              <Button variant="neon" onClick={() => setCurrentView('profile')}>Rejoindre la communauté</Button>
            </div>
          );
        }
        return <Community currentUser={store.currentUser} />;
      case 'settings':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
            <h1 className="text-4xl text-white bebas tracking-wider">Paramètres</h1>
            <Card className="p-6 space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg text-white uppercase tracking-tight">Unité de Mesure</h3>
                <div className="flex bg-black/30 p-1 rounded-xl w-32">
                  <button 
                    onClick={() => store.setUnit('kg')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${store.unit === 'kg' ? 'bg-neon text-black' : 'text-gray-500'}`}
                  >
                    KG
                  </button>
                  <button 
                    onClick={() => store.setUnit('lbs')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${store.unit === 'lbs' ? 'bg-neon text-black' : 'text-gray-500'}`}
                  >
                    LBS
                  </button>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-8">
                <h3 className="text-lg text-white uppercase tracking-tight">Sauvegarde & Restauration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest pl-1">Exporter</p>
                    <Button variant="outline" className="w-full gap-2" onClick={store.exportData}>
                      <Download className="w-4 h-4" /> Sauvegarder .JSON
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest pl-1">Restaurer</p>
                    <label className="block">
                      <div className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-gray-300 text-sm hover:border-neon hover:text-neon transition-all cursor-pointer">
                        <Upload className="w-4 h-4" /> Importer .JSON
                      </div>
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result;
                              if (typeof result === 'string') {
                                if (store.importData(result)) alert('Données restaurées !');
                              }
                            };
                            reader.readAsText(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest pl-1">Danger Zone</p>
                    <Button variant="danger" className="w-full gap-2" onClick={store.resetData}>
                      <Trash2 className="w-4 h-4" /> Tout Effacer
                    </Button>
                  </div>
                </div>
              </div>

              {store.currentUser && (
                <div className="space-y-4 border-t border-white/5 pt-8">
                  <h3 className="text-lg text-white uppercase tracking-tight">Synchronisation Cloud</h3>
                  <div className="p-4 bg-neon/5 border border-neon/10 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-white font-bold uppercase tracking-widest">Sauvegarde Cloud activée</p>
                      <p className="text-[10px] text-gray-500">Tes records sont automatiquement partagés avec la communauté.</p>
                    </div>
                    <Button variant="neon" size="sm" onClick={store.syncDataToCloud}>Synchroniser maintenant</Button>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 text-gray-600 bg-black/20 p-4 rounded-xl border border-white/5">
                  <ShieldCheck className="w-5 h-5 text-neon" />
                  <p className="text-xs">Tes données restent locales sur cet appareil. Track&W ne stocke aucune donnée sur ses serveurs.</p>
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-dark-surface border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neon rounded flex items-center justify-center p-1.5">
            <Dumbbell className="w-full h-full text-black" />
          </div>
          <span className="bebas text-2xl tracking-widest text-neon uppercase">Track&W</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Desktop Sidebar / Mobile Drawer */}
      <nav className={`
        fixed inset-0 z-40 bg-dark-bg md:relative md:flex md:flex-col md:w-64 md:border-r border-white/5 p-6 space-y-10
        transition-transform duration-300 md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 bg-neon rounded-lg flex items-center justify-center shadow-lg shadow-neon/20 p-2">
            <Dumbbell className="w-full h-full text-black" />
          </div>
          <h1 className="bebas text-3xl tracking-[0.1em] text-white uppercase">Track&W</h1>
        </div>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-xl font-display uppercase tracking-widest text-sm transition-all
                ${currentView === item.id 
                  ? 'bg-neon/10 text-neon shadow-[inset_0_0_10px_rgba(232,255,11,0.05)] border border-neon/10' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-neon' : ''}`} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-10 pb-4">
          <Card className="p-4 bg-gradient-to-br from-neon/10 to-transparent border-neon/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-12 h-12 text-neon" />
            </div>
            <div className="flex justify-between items-center mb-1 relative z-10">
              <p className="text-[10px] font-bold text-neon uppercase tracking-tighter">Niveau Athlète</p>
              <Badge variant="neon" className="text-[10px] h-5 font-mono px-2">LVL {store.userLevel}</Badge>
            </div>
            <p className="text-white font-display text-lg uppercase leading-tight italic relative z-10">
              {store.userLevel < 5 ? 'Novice d\'Acier' : store.userLevel < 15 ? 'Guerrier du Fonte' : 'Alpha de la Meute'}
            </p>
            <div className="mt-3 relative z-10">
               <div className="flex justify-between items-end mb-1">
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Progression XP</span>
                  <span className="text-[8px] text-neon font-mono uppercase tracking-widest">{store.xp % 500} / 500</span>
               </div>
               <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-neon shadow-[0_0_10px_rgba(232,255,11,0.5)] transition-all duration-1000" 
                    style={{ width: `${(store.xp % 500) / 500 * 100}%` }} 
                  />
               </div>
            </div>
          </Card>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
        <div className="max-w-6xl mx-auto pb-24 md:pb-0">
          {renderView()}
        </div>
      </main>

      {/* Mobile Tab Bar (Fallback for accessibility) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-surface/80 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-2 z-30">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === item.id ? 'text-neon' : 'text-gray-500'}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[7px] uppercase font-bold tracking-widest leading-none text-center px-1">
              {item.label.includes('&') ? item.label.split('&')[0] : item.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      <Modal isOpen={!!selectedExercise} onClose={() => setSelectedExercise(null)} title={selectedExercise?.name}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(selectedExercise?.muscleGroups || []).map(mg => (
              <Badge key={mg} variant="neon">{mg}</Badge>
            ))}
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">{selectedExercise?.description}</p>
          {selectedExercise?.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-white/10">
              <img src={selectedExercise.imageUrl} alt={selectedExercise.name} className="w-full h-auto opacity-80" referrerPolicy="no-referrer" />
            </div>
          )}
          <Button variant="secondary" className="w-full" onClick={() => setSelectedExercise(null)}>Fermer</Button>
        </div>
      </Modal>
    </div>
  );
}

