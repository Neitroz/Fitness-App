import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, limit, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { Card, Badge, Modal, Button } from './UI';
import { Users, Trophy, Activity, ArrowRight, User as UserIcon, Calendar, Dumbbell, ShieldCheck, Star, Award, Medal } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ManualPR, WorkoutSession } from '../types';

export function Community({ currentUser }: { currentUser: any }) {
  const [feed, setFeed] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userAchievments, setUserAchievements] = useState<any[]>([]);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersData = usersSnap.docs.reduce((acc, doc) => {
          acc[doc.id] = { id: doc.id, ...doc.data() };
          return acc;
        }, {} as any);
        setUsers(Object.values(usersData));

        const prsQuery = query(
          collection(db, 'manual_prs'), 
          where('isShared', '==', true),
          orderBy('date', 'desc'), 
          limit(30)
        );
        const prsSnap = await getDocs(prsQuery);
        const prs = prsSnap.docs.map(d => ({
          ...d.data(),
          id: d.id,
          type: 'pr' as const,
          user: usersData[d.data().userId] || { displayName: 'Inconnu' }
        }));

        const workoutsQuery = query(
          collection(db, 'workouts'), 
          where('isShared', '==', true),
          orderBy('date', 'desc'), 
          limit(30)
        );
        const workoutsSnap = await getDocs(workoutsQuery);
        const workouts = workoutsSnap.docs.map(d => ({
          ...d.data(),
          id: d.id,
          type: 'workout' as const,
          user: usersData[d.data().userId] || { displayName: 'Inconnu' }
        }));

        const combinedFeed = [...prs, ...workouts].sort((a, b) => 
          new Date((b as any).date).getTime() - new Date((a as any).date).getTime()
        ).slice(0, 40);

        setFeed(combinedFeed);
      } catch (err) {
        console.error("Error fetching community data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, []);

  const handleViewProfile = async (user: any) => {
    setSelectedUser(user);
    setUserAchievements([]);
    try {
      const prsQuery = query(
        collection(db, 'manual_prs'),
        where('userId', '==', user.id),
        where('isShared', '==', true)
      );
      const snap = await getDocs(prsQuery);
      const prs = snap.docs.map(doc => doc.data());
      setUserAchievements(prs);
    } catch (e) {
      console.error("Error loading user profile achievements:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Chargement de la meute...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-neon rounded-lg flex items-center justify-center rotate-3 border-2 border-black/20 shadow-lg">
                <Users className="w-6 h-6 text-black" />
             </div>
             <h1 className="text-4xl text-white bebas tracking-wider italic">La Meute Track&W</h1>
          </div>
          <p className="text-gray-500 uppercase font-bold tracking-[0.2em] text-[10px] pl-1">Le flux d'acier : Records et entraînements partagés</p>
        </div>
        
        <div className="flex gap-4">
          <Card className="px-4 py-2 bg-neon/10 border-neon/20 flex items-center gap-3">
            <Users className="w-5 h-5 text-neon" />
            <div>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tight">Athlètes</p>
              <p className="text-xl text-white font-mono leading-none">{users.length}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-l-2 border-neon pl-4">
            <h2 className="text-2xl text-white bebas tracking-wider uppercase">Flux d'Activité</h2>
          </div>

          <div className="space-y-4">
            {feed.length > 0 ? feed.map((item, i) => (
              <Card key={item.id} className="p-4 hover:border-white/10 transition-all group relative overflow-hidden">
                {item.type === 'pr' && (
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <Trophy className="w-16 h-16 text-neon" />
                  </div>
                )}
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => handleViewProfile(item.user)}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="w-10 h-10 rounded-full bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                        {item.user.photoURL ? (
                          <img src={item.user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-display uppercase tracking-tight italic group-hover:text-neon transition-colors">
                          {item.user.displayName}
                        </h4>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest italic leading-none">
                          {format(new Date(item.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </button>
                    <Badge variant={item.type === 'pr' ? 'neon' : 'gray'} className="text-[8px] uppercase italic">
                      {item.type === 'pr' ? 'Nouveau Record' : 'Séance Terminée'}
                    </Badge>
                  </div>

                  <div className="pl-13">
                    {item.type === 'pr' ? (
                      <div className="space-y-1">
                        <p className="text-lg text-white font-display uppercase italic">
                          <span className="text-neon">{item.exerciseName}</span>
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl text-white font-mono">{item.weight}kg</span>
                          <span className="text-sm text-gray-600 font-mono italic">x {item.reps} reps</span>
                          {item.isWeighted && <Badge variant="gray" className="scale-75 origin-left">Lesté</Badge>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-lg text-white font-display uppercase italic">{item.name}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Badge variant="gray" className="text-[9px] opacity-70">
                            <Dumbbell className="w-3 h-3 mr-1" /> {item.entries?.length || 0} Ex.
                          </Badge>
                          <Badge variant="gray" className="text-[9px] opacity-70">
                            <Activity className="w-3 h-3 mr-1" /> Intense
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )) : (
              <p className="text-gray-600 italic text-sm text-center py-10 bg-black/10 rounded-xl border border-dashed border-white/5 font-mono uppercase tracking-[0.2em]">
                Silence radio dans la meute... Sois le premier à briser l'acier.
              </p>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-l-2 border-neon pl-4">
            <h2 className="text-2xl text-white bebas tracking-wider uppercase">Membres Actifs</h2>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {users.map(user => (
              <Card 
                key={user.id} 
                onClick={() => handleViewProfile(user)}
                className="p-3 flex items-center justify-between hover:bg-neon/5 cursor-pointer transition-all border-white/5 hover:border-neon/20 group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-gray-700" />
                      )}
                    </div>
                    {user.lastActive && new Date(user.lastActive).getTime() > Date.now() - 300000 && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon rounded-full border-2 border-[#0a0a0a]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white font-display uppercase italic group-hover:text-neon transition-colors leading-none mb-1">{user.displayName}</p>
                    <div className="flex items-center gap-1.5 opacity-50">
                       <ShieldCheck className="w-3 h-3 text-neon" />
                       <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tight">Membre IronFlow</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-800 group-hover:text-neon group-hover:translate-x-1 transition-all" />
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Profil Athlète">
        {selectedUser && (
          <div className="space-y-8 py-2">
               <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full border-4 border-neon p-1 shadow-[0_0_20px_rgba(232,255,71,0.2)]">
                        <div className="w-full h-full rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                          {selectedUser.photoURL ? (
                            <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-12 h-12 text-gray-700" />
                          )}
                        </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neon text-black px-3 py-0.5 rounded-full text-[10px] font-bold uppercase italic tracking-widest shadow-lg">
                      Rang : {userAchievments.length >= 8 ? 'Alpha' : userAchievments.length >= 4 ? 'Elite' : userAchievments.length >= 2 ? 'Vétéran' : 'Novice'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-4xl text-white bebas tracking-wider italic mb-1">{selectedUser.displayName}</h3>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1.5 text-neon/60 text-[9px] font-mono uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        Athlète Certifié
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <div className="flex items-center gap-1.5 text-gray-500 text-[9px] font-mono uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        Depuis le {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'MM/yy') : '05/26'}
                      </div>
                    </div>
                  </div>
                  {selectedUser.bio && (
                    <div className="relative mt-2">
                       <div className="absolute -left-2 top-0 text-neon/20 text-4xl font-serif">"</div>
                       <p className="text-sm text-gray-300 italic font-sans px-4 max-w-sm">{selectedUser.bio}</p>
                       <div className="absolute -right-2 bottom-0 text-neon/20 text-4xl font-serif">"</div>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                      <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Records Partagés</p>
                      <p className="text-2xl text-white font-display italic">{userAchievments.length}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                      <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Impact Communautaire</p>
                      <p className="text-2xl text-neon font-display italic">
                        {userAchievments.length >= 8 ? 'Alpha' : userAchievments.length >= 4 ? 'Bêta' : 'Loup'}
                      </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                     <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-neon" />
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] italic">Tableau de Chasse</h4>
                     </div>
                     <span className="text-[8px] text-gray-600 font-mono uppercase tracking-widest">Records d'Acier</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {userAchievments.length > 0 ? userAchievments.map((pr: any, i: number) => (
                       <Card key={i} className="p-3 bg-neon/5 border-neon/10 hover:bg-neon/10 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                             <p className="text-[9px] text-neon font-bold uppercase tracking-widest">{pr.exerciseName}</p>
                             <Star className="w-3 h-3 text-neon/30 group-hover:text-neon transition-colors" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl text-white font-mono leading-none">{pr.weight}kg</span>
                            <span className="text-[10px] text-gray-500 font-mono italic">x {pr.reps} reps</span>
                          </div>
                       </Card>
                     )) : (
                       <div className="col-span-full py-8 text-center bg-black/20 rounded-xl border border-dashed border-white/5">
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">Aucun trophée à afficher</p>
                       </div>
                     )}
                  </div>
               </div>

            <Button variant="secondary" className="w-full" onClick={() => setSelectedUser(null)}>Fermer</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
