import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, AlertCircle, Play, UserCheck2 } from 'lucide-react';
import { Player } from '../types';
import { audioSystem } from '../utils/audio';

interface SetupScreenProps {
  onStartGame: (players: Player[]) => void;
}

export default function SetupScreen({ onStartGame }: SetupScreenProps) {
  const [names, setNames] = useState<string[]>([
    'Nikesh',
    'Unish',
    'Paras',
    'Kuldeep'
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
    audioSystem.playClick();
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
        className="w-full max-w-lg bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-colors duration-250"
        id="setup-screen-container"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-theme-success-bg/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-theme-success-bg/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-theme-success-bg border border-theme-success-border text-theme-success rounded-2xl flex items-center justify-center shadow-inner mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-brand-from to-brand-to uppercase">
            NIKESH CALLBREAK
          </h1>
          <p className="text-[var(--text-muted)] mt-2 text-xs max-w-sm font-medium uppercase tracking-wider transition-colors duration-250">
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
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-theme-success/55">
                  <UserCheck2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  maxLength={16}
                  id={`player-input-${idx + 1}`}
                  value={name}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  placeholder={`Player ${idx + 1} Name`}
                  className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-theme-success focus:ring-1 focus:ring-theme-success/30 font-medium transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold font-mono text-[var(--text-muted)] uppercase tracking-wider transition-colors duration-250">
                  Player {idx + 1}
                </span>
              </motion.div>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 p-4 bg-theme-danger-bg border border-theme-danger-border text-theme-danger rounded-2xl text-sm"
              id="setup-error-alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-theme-danger" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              id="btn-randomize-names"
              onClick={handleRandomizeNames}
              className="px-5 py-3.5 border border-[var(--border-color)] bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-semi-muted)] hover:text-[var(--text-main)] font-semibold rounded-2xl text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-95"
            >
              Shuffle
            </button>
            <button
              type="submit"
              id="btn-start-game"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-from to-brand-to text-brand-text font-bold rounded-2xl shadow-lg shadow-theme-success/10 hover:shadow-xl hover:shadow-theme-success/20 cursor-pointer transition-all hover:translate-y-[-1px] active:scale-95"
            >
              <span className="uppercase tracking-widest text-xs">Start Match</span>
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
