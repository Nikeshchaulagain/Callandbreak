import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, AlertCircle, Play, UserCheck2 } from 'lucide-react';
import { Player } from '../types';

interface SetupScreenProps {
  onStartGame: (players: Player[]) => void;
}

export default function SetupScreen({ onStartGame }: SetupScreenProps) {
  const [names, setNames] = useState<string[]>([
    'Nikesh',
    'Emma',
    'Sam',
    'Sophia'
  ]);
  const [error, setError] = useState<string>('');

  const handleNameChange = (index: number, val: string) => {
    const updated = [...names];
    updated[index] = val;
    setNames(updated);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    const trimmedNames = names.map(n => n.trim());
    
    if (trimmedNames.some(n => n === '')) {
      setError('All 4 players must have a name!');
      return;
    }

    const uniqueNames = new Set(trimmedNames.map(n => n.toLowerCase()));
    if (uniqueNames.size !== 4) {
      setError('Each player must have a unique name!');
      return;
    }

    const players: Player[] = trimmedNames.map((name, index) => ({
      id: `p${index + 1}`,
      name,
    }));

    onStartGame(players);
  };

  const handleRandomizeNames = () => {
    const presetPools = [
      ['Rohan', 'Anjali', 'Bibek', 'Sandesh'],
      ['Nikesh', 'Aarav', 'Maya', 'Pradeep'],
      ['Kiran', 'Sita', 'Hari', 'Gita'],
      ['Alex', 'Jordan', 'Taylor', 'Morgan']
    ];
    const randomSet = presetPools[Math.floor(Math.random() * presetPools.length)];
    setNames(randomSet);
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg bg-[#111115]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        id="setup-screen-container"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 uppercase">
            NIKESH CALLBREAK
          </h1>
          <p className="text-white/40 mt-2 text-xs max-w-sm font-medium uppercase tracking-wider">
            Match Configuration Setup
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            {names.map((name, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400/55">
                  <UserCheck2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  maxLength={16}
                  id={`player-input-${idx + 1}`}
                  value={name}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  placeholder={`Player ${idx + 1} Name`}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-medium transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold font-mono text-white/30 uppercase tracking-wider">
                  Player {idx + 1}
                </span>
              </motion.div>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm"
              id="setup-error-alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              id="btn-randomize-names"
              onClick={handleRandomizeNames}
              className="px-5 py-3.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 font-semibold rounded-2xl text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-95"
            >
              Shuffle
            </button>
            <button
              type="submit"
              id="btn-start-game"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.55)] cursor-pointer transition-all hover:translate-y-[-1px] active:scale-95"
            >
              <span className="uppercase tracking-widest text-xs">Start Match</span>
              <Play className="w-4 h-4 fill-current text-black" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
