import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Star } from 'lucide-react';

interface XpNotificationProps {
  xp: number;
  levelUp: boolean;
  level?: number;
}

export function XpNotification({ xp, levelUp, level }: XpNotificationProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <AnimatePresence>
        <motion.div
           initial={{ y: -50, opacity: 0, scale: 0.8 }}
           animate={{ y: 0, opacity: 1, scale: 1 }}
           exit={{ y: -20, opacity: 0, scale: 0.9 }}
           className="bg-dark-surface/90 backdrop-blur-xl border border-neon/30 px-6 py-4 rounded-2xl shadow-[0_0_40px_rgba(232,255,11,0.2)] flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(232,255,11,0.4)]">
            {levelUp ? (
              <Trophy className="w-7 h-7 text-black animate-bounce" />
            ) : (
              <Star className="w-7 h-7 text-black" fill="currentColor" />
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] text-neon font-bold uppercase tracking-[3px]">
              Expérience Gagnée
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-white bebas tracking-wider">+{xp} XP</span>
              {levelUp && (
                <motion.span 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sport-orange font-display italic uppercase text-sm"
                >
                  NIVEAU SUIVANT !
                </motion.span>
              )}
            </div>
          </div>

          {levelUp && (
            <div className="absolute -inset-1 rounded-2xl bg-neon/10 animate-pulse pointer-events-none" />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
