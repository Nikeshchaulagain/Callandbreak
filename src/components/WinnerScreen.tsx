import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Sparkles, RefreshCw, Calendar, Flame, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Player, RoundData, PlayerStats } from '../types';
import { computeStats } from './Leaderboard';

interface WinnerScreenProps {
  players: Player[];
  rounds: RoundData[];
  onPlayAgainSame: () => void;
  onFullReset: () => void;
  onBackToGame: () => void;
}

export default function WinnerScreen({
  players,
  rounds,
  onPlayAgainSame,
  onFullReset,
  onBackToGame
}: WinnerScreenProps) {
  const stats = computeStats(players, rounds);
  
  // Players ordered by rank (1st, 2nd, 3rd, 4th)
  // Let's safe-guard in case stats is empty, but it has exactly 4 elements
  const podium1st = stats.find(s => s.rank === 1) || stats[0];
  const podium2nd = stats.find(s => s.rank === 2) || stats[1];
  const podium3rd = stats.find(s => s.rank === 3) || stats[2];
  const podium4th = stats.find(s => s.rank === 4) || stats[3];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10 relative" id="winner-screen-container">
      {/* Decorative Fireworks / Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="inline-flex p-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black rounded-3xl shadow-2xl shadow-emerald-500/20 mb-2"
        >
          <Trophy className="w-12 h-12 text-black" />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-emerald-400 font-black uppercase tracking-widest text-xs font-mono"
        >
          Tournament Concluded • 5 Rounds Locked
        </motion.p>
        
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black font-display bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 uppercase tracking-tight"
        >
          Victory Declared
        </motion.h1>
      </div>

      {/* 3D-Like Victory Podium */}
      <div className="grid grid-cols-3 gap-3 items-end max-w-lg mx-auto pt-10" id="podium-holder">
        
        {/* 2nd Place Podium */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex flex-col items-center"
        >
          <span className="text-white/60 text-xs font-bold mb-2 max-w-[80px] truncate text-center uppercase tracking-wider flex items-center gap-1 justify-center">
            🥈 {podium2nd?.name}
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-400 text-slate-950 font-black flex items-center justify-center border-2 border-white/10 text-sm shadow-md z-10">
            🥈
          </div>
          <div className="w-full bg-[#111115] border border-white/10 rounded-t-2xl h-24 flex flex-col items-center justify-center shadow-inner mt-[-16px] pt-4">
            <span className="font-mono font-black text-white text-base">
              {podium2nd?.totalScore.toFixed(1)}
            </span>
            <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono font-bold">PTS</span>
          </div>
        </motion.div>

        {/* 1st Place Podium */}
        <motion.div
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="flex flex-col items-center relative"
        >
          <div className="absolute top-[-44px] text-emerald-400 animate-pulse">
            <Sparkles className="w-7 h-7 fill-emerald-500/20" />
          </div>
          <span className="text-emerald-400 font-extrabold text-sm mb-2 max-w-[100px] truncate text-center uppercase tracking-widest flex items-center gap-1 justify-center">
            👑 {podium1st?.name}
          </span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-450 to-cyan-455 text-black font-black flex items-center justify-center border-2 border-white/20 text-base shadow-lg z-10">
            🥇
          </div>
          <div className="w-full bg-emerald-500/10 border-2 border-emerald-500/30 rounded-t-3xl h-36 flex flex-col items-center justify-center shadow-2xl mt-[-20px] pt-4">
            <span className="font-mono font-black text-emerald-400 text-xl text-glow-emerald">
              {podium1st?.totalScore.toFixed(1)}
            </span>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-extrabold">PTS</span>
          </div>
        </motion.div>

        {/* 3rd Place Podium */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="flex flex-col items-center"
        >
          <span className="text-amber-600 dark:text-amber-500/90 text-xs font-bold mb-2 max-w-[80px] truncate text-center uppercase tracking-wider flex items-center gap-1 justify-center">
            🥉 {podium3rd?.name}
          </span>
          <div className="w-8 h-8 rounded-full bg-amber-700/80 text-white font-black flex items-center justify-center border-2 border-white/5 text-sm shadow-md z-10">
            🥉
          </div>
          <div className="w-full bg-[#111115] border border-white/5 rounded-t-2xl h-18 flex flex-col items-center justify-center shadow-inner mt-[-16px] pt-4">
            <span className="font-mono font-black text-white/80 text-sm">
              {podium3rd?.totalScore.toFixed(1)}
            </span>
            <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono font-bold">PTS</span>
          </div>
        </motion.div>

      </div>

      {/* 4th Place Card */}
      {podium4th && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-xs mx-auto p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between text-xs text-white/50"
          id="fourth-place-panel"
        >
          <span className="font-bold font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-lg mr-2 uppercase tracking-wide text-[9px]">4th position</span>
          <span className="font-bold text-white/80 flex-1 truncate">{podium4th.name}</span>
          <span className="font-mono font-black text-white">{podium4th.totalScore.toFixed(1)} pts</span>
        </motion.div>
      )}

      {/* Detailed Match Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="stats-holder">
        {stats.map((stat, idx) => {
          const totalCalls = stat.successfulCalls + stat.failedCalls;
          const accuracy = totalCalls > 0 ? Math.round((stat.successfulCalls / totalCalls) * 100) : 0;
          
          return (
            <motion.div
              key={stat.id}
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="bg-[#111115]/65 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between"
              id={`stat-card-${stat.id}`}
            >
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg font-black text-sm flex items-center justify-center ${
                    stat.rank === 1
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black'
                      : stat.rank === 2
                      ? 'bg-slate-500 text-black'
                      : stat.rank === 3
                      ? 'bg-amber-750 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {stat.rank === 1 ? '🥇' : stat.rank === 2 ? '🥈' : stat.rank === 3 ? '🥉' : `#${stat.rank}`}
                  </span>
                  <h4 className="font-bold text-white text-base">
                    {stat.name}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-emerald-400 text-base md:text-lg text-glow-emerald">
                    {stat.totalScore.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase font-black font-mono ml-1.5">PTS</span>
                </div>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-3 gap-2 py-4 text-center">
                <div className="p-2 sm:p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider block">
                    Bids Success
                  </span>
                  <span className="font-mono font-bold text-white block text-xs sm:text-xs mt-1">
                    {stat.successfulCalls} / {totalCalls}
                  </span>
                </div>
                
                <div className="p-2 sm:p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider block">
                    Avg Score
                  </span>
                  <span className="font-mono font-bold text-white block text-xs sm:text-xs mt-1">
                    {stat.avgScore.toFixed(1)}
                  </span>
                </div>

                <div className="p-2 sm:p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Best hand
                  </span>
                  <span className="font-mono font-bold text-emerald-450 block text-xs sm:text-xs mt-1">
                    +{stat.highestRound.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Success Ratio Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase tracking-wider">
                  <span>Accuracy on estimations</span>
                  <span className="font-mono font-bold text-emerald-400">{accuracy}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Recovery & Replay Action Board */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4" id="action-board text-center">
        <button
          onClick={onBackToGame}
          id="btn-back-to-scoreboard"
          className="w-full sm:w-auto px-5 py-3.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grid</span>
        </button>

        <button
          onClick={onPlayAgainSame}
          id="btn-play-again-same"
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.55)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-xs uppercase tracking-widest"
        >
          <RefreshCw className="w-4 h-4 text-black" />
          <span>Rematch Same Players</span>
        </button>

        <button
          onClick={onFullReset}
          id="btn-full-reset-winner"
          className="w-full sm:w-auto px-5 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs uppercase tracking-widest"
        >
          <span>Configure New Game</span>
        </button>
      </div>
    </div>
  );
}
