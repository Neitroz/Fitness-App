import React, { useState, useMemo } from 'react';
import { Exercise, MUSCLE_GROUPS } from '../types';
import { Card, Button, Input, Modal, Badge } from './UI';
import { Search, Plus, Info, Edit2, Trash2, Dumbbell } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function ExerciseLibrary({ 
  exercises, 
  onAdd, 
  onUpdate, 
  onDelete,
  onViewDetails
}: { 
  exercises: Exercise[];
  onAdd: (ex: Exercise) => void;
  onUpdate: (ex: Exercise) => void;
  onDelete: (id: string) => void;
  onViewDetails: (ex: Exercise) => void;
}) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);

  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [customMuscle, setCustomMuscle] = useState('');

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(search.toLowerCase()) || 
      (ex.muscleGroups || []).some(mg => mg.toLowerCase().includes(search.toLowerCase()))
    );
  }, [exercises, search]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let finalMuscles = [...selectedMuscles];
    if (customMuscle.trim() && !finalMuscles.includes(customMuscle.trim())) {
      finalMuscles.push(customMuscle.trim());
    }

    const data = {
      name: formData.get('name') as string,
      muscleGroups: finalMuscles.length > 0 ? finalMuscles : ["Autre"],
      description: formData.get('description') as string,
      imageUrl: formData.get('imageUrl') as string || null,
      isUnilateral: formData.get('isUnilateral') === 'on',
    };

    if (editingEx) {
      onUpdate({
        ...editingEx,
        ...data,
      });
    } else {
      onAdd({
        id: uuidv4(),
        ...data,
        createdAt: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
    setEditingEx(null);
    setSelectedMuscles([]);
    setCustomMuscle('');
  };

  const openEditModal = (ex: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEx(ex);
    setSelectedMuscles(ex.muscleGroups || []);
    setIsModalOpen(true);
  };

  const toggleMuscle = (mg: string) => {
    setSelectedMuscles(prev => 
      prev.includes(mg) ? prev.filter(m => m !== mg) : [...prev, mg]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl text-white bebas tracking-wider">Bibliothèque</h1>
        <Button variant="neon" className="gap-2" onClick={() => { setEditingEx(null); setSelectedMuscles([]); setCustomMuscle(''); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5" />
          Nouvel Exercice
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <Input 
          placeholder="Rechercher un exercice..." 
          className="pl-11" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredExercises.map(ex => (
          <Card 
            key={ex.id} 
            className="group cursor-pointer hover:border-neon/30 transition-all active:scale-[0.98]"
            onClick={() => onViewDetails(ex)}
          >
            {ex.imageUrl && (
              <div className="h-32 overflow-hidden bg-black/50">
                <img 
                  src={ex.imageUrl} 
                  alt={ex.name} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg text-white font-display group-hover:text-neon transition-colors truncate max-w-[150px]">
                    {ex.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(ex.muscleGroups || []).slice(0, 2).map(mg => (
                      <span key={mg} className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{mg}</span>
                    ))}
                    {(ex.muscleGroups || []).length > 2 && <span className="text-[9px] text-gray-400">+{(ex.muscleGroups || []).length - 2}</span>}
                  </div>
                </div>
                {ex.isUnilateral && (
                  <Badge variant="orange" className="text-[8px]">Unilatéral</Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <Badge variant="gray">Détails</Badge>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => openEditModal(ex, e)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Supprimer cet exercice?')) onDelete(ex.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingEx(null); setSelectedMuscles([]); }}
        title={editingEx ? "Modifier l'exercice" : "Créer un exercice"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Nom</label>
            <Input name="name" defaultValue={editingEx?.name} required placeholder="ex: Développé couché" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 block">Groupes Musculaires</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(mg => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => toggleMuscle(mg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${selectedMuscles.includes(mg) ? 'bg-neon/10 border-neon text-neon' : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/30'}`}
                >
                  {mg}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={customMuscle}
                onChange={(e) => setCustomMuscle(e.target.value)}
                placeholder="Ajouter un autre muscle..."
                className="h-8 text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Description</label>
            <textarea 
              name="description" 
              defaultValue={editingEx?.description}
              rows={3} 
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 transition-all font-sans"
              placeholder="Notes techniques..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">URL Image (Optionnel)</label>
            <Input name="imageUrl" defaultValue={editingEx?.imageUrl || ''} placeholder="https://..." />
          </div>

          <div className="flex items-center gap-3 py-2">
            <input 
              type="checkbox" 
              name="isUnilateral" 
              id="isUnilateral"
              defaultChecked={editingEx?.isUnilateral}
              className="w-5 h-5 accent-neon bg-black border-white/10" 
            />
            <label htmlFor="isUnilateral" className="text-sm text-gray-300">Exercice Unilatéral</label>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" variant="neon" className="flex-1">Sauvegarder</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
