import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Card, Input, Button, Badge } from './UI';
import { LogIn, UserPlus, LogOut, User as UserIcon, ShieldCheck, Mail } from 'lucide-react';

export function Auth({ user }: { user: any }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // Limit roughly to fit in Firestore 1MB doc with margin
      setError("La photo est trop lourde. Maximum 800KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(user, { 
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL 
      });
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL,
        bio: bio,
        lastActive: serverTimestamp()
      }, { merge: true });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        });
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError("La connexion par Email n'est pas encore activée dans la console Firebase. Activez-la dans Authentication > Sign-in method.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
        <Card className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-neon/10 border-2 border-neon flex items-center justify-center overflow-hidden">
                  {(photoURL || user.photoURL) ? (
                    <img src={photoURL || user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-neon" />
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -right-1 -bottom-1 p-2 bg-neon rounded-lg text-black shadow-lg hover:scale-110 transition-transform"
                >
                  <LogIn className="w-4 h-4 rotate-90" />
                </button>
              </div>
              
              {!isEditing ? (
                <div className="text-center">
                  <h2 className="text-2xl text-white font-display uppercase italic">{user.displayName || 'Athlète'}</h2>
                  <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">{user.email}</p>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="w-full space-y-4 pt-4 border-t border-white/5">
                  <Input 
                    label="Pseudonyme"
                    value={displayName}
                    placeholder={user.displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bio / Slogan</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 text-sm h-20"
                      placeholder="Ta motivation en quelques mots..."
                    />
                  </div>
                  <Button variant="neon" size="sm" className="w-full" type="submit" loading={loading}>
                    Mettre à jour le profil
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                </form>
              )}
          </div>

          <div className="pt-4 border-t border-white/5">
            <Button variant="secondary" className="w-full gap-2 text-red-500 hover:bg-red-500/10 border-red-500/20" onClick={() => signOut(auth)}>
              <LogOut className="w-4 h-4" /> Se déconnecter
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-8 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-6 mb-8">
        <div className="w-12 h-12 bg-neon rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-neon/20">
          <ShieldCheck className="w-7 h-7 text-black" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-3xl text-white bebas tracking-wider italic">
            {isLogin ? 'Bon retour Athlète' : 'Rejoins la meute'}
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
            {isLogin ? 'Connecte-toi pour synchroniser tes PRs' : 'Crée ton compte pour partager tes exploits'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <Input 
            label="Pseudonyme / Nom"
            placeholder="Ex: John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        )}
        <Input 
          label="Identifiant (Email)"
          type="email"
          placeholder="athlet@ironflow.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input 
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold uppercase tracking-widest text-center animate-shake">
            {error}
          </div>
        )}

        <Button variant="neon" type="submit" className="w-full gap-2" loading={loading}>
          {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {isLogin ? 'Se connecter' : 'Créer un compte'}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-widest">
            <span className="bg-dark-bg px-2 text-gray-600">Ou continuer avec</span>
          </div>
        </div>

        <Button 
          variant="secondary" 
          type="button" 
          className="w-full gap-2 border-white/10" 
          onClick={handleGoogleLogin}
          loading={loading}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em] hover:text-neon transition-colors"
        >
          {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </Card>
  );
}
