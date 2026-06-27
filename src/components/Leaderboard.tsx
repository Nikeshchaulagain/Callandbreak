import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, TrendingUp, Sparkles, AlertCircle, Crown } from 'lucide-react';
import { Player, RoundData, PlayerStats } from '../types';

interface LeaderboardProps {
  players: Player[];
  rounds: RoundData[];
  onDeclareWinner?: () => void;
  isGameComplete: boolean;
}

export function computeStats(players: Player[], rounds: RoundData[]): PlayerStats[] {
  const stats: PlayerStats[] = players.map(player => {
    let totalScore = 0;
    let highestRound = -Infinity;
    let lowestRound = Infinity;
    let successfulCalls = 0;
    let failedCalls = 0;
    let roundsPlayed = 0;

    rounds.forEach(round => {
      if (round.isLocked) {
        const pEntry = round.playersData[player.id];
        if (pEntry) {
          roundsPlayed++;
          totalScore += pEntry.score;
          if (pEntry.score > highestRound) highestRound = pEntry.score;
          if (pEntry.score < lowestRound) lowestRound = pEntry.score;
          
          if (pEntry.tricks >= pEntry.bid) {
            successfulCalls++;
          } else {
            failedCalls++;
          }
        }
      }
    });

    return {
      id: player.id,
      name: player.name,
      totalScore: Number(totalScore.toFixed(2)),
      avgScore: roundsPlayed > 0 ? Number((totalScore / roundsPlayed).toFixed(2)) : 0,
      highestRound: highestRound === -Infinity ? 0 : Number(highestRound.toFixed(1)),
      lowestRound: lowestRound === Infinity ? 0 : Number(lowestRound.toFixed(1)),
      successfulCalls,
      failedCalls,
    };
  });

  // Sort descending by total score
  const sortedStats = [...stats].sort((a, b) => b.totalScore - a.totalScore);
  
  // Assign ranks (handling ties elegantly)
  let currentRank = 1;
  for (let i = 0; i < sortedStats.length; i++) {
    if (i > 0 && sortedStats[i].totalScore < sortedStats[i - 1].totalScore) {
      currentRank = i + 1;
    }
    sortedStats[i].rank = currentRank;
  }

  return sortedStats;
}

export default function Leaderboard({ players, rounds, onDeclareWinner, isGameComplete }: LeaderboardProps) {
  const stats = computeStats(players, rounds);
  const activeRoundsCount = rounds.filter(r => r.isLocked).length;

  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl h-full flex flex-col transition-colors duration-250" id="leaderboard-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-theme-success" />
          <h3 className="font-bold text-sm uppercase tracking-wider font-display text-[var(--text-main)]">
            Current Standings
          </h3>
        </div>
        <span className="text-[10px] bg-theme-success-bg border border-theme-success-border text-theme-success px-3 py-1 rounded-full font-bold font-mono uppercase tracking-wider">
          Rounds: {activeRoundsCount}/5
        </span>
      </div>

      <div className="space-y-3.5 flex-1">
        {stats.map((stat, index) => {
          const isFirst = stat.rank === 1 && activeRoundsCount > 0;
          
          return (
            <motion.div
              key={stat.id}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                isFirst
                  ? 'bg-theme-success-bg border-theme-success-border shadow-lg shadow-theme-success/5'
                  : 'bg-[var(--bg-hover)] border-[var(--border-color)]'
              }`}
              id={`leaderboard-row-${stat.id}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                  stat.rank === 1
                    ? 'bg-gradient-to-r from-brand-from to-brand-to text-brand-text'
                    : stat.rank === 2
                    ? 'bg-[var(--btn-secondary-hover)] text-[var(--text-main)]'
                    : stat.rank === 3
                    ? 'bg-[var(--btn-secondary-bg)] text-[var(--text-semi-muted)]'
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                }`}>
                  {stat.rank}
                </span>
                <div>
                  <div className="font-bold text-[var(--text-main)] flex items-center gap-1.5 text-sm">
                    <span>{stat.name}</span>
                    {isFirst && <Sparkles className="w-3.5 h-3.5 text-theme-success fill-theme-success-bg" />}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5 uppercase font-medium tracking-wider">
                    <span className="flex items-center gap-0.5 text-theme-success">
                      <TrendingUp className="w-3 h-3" />
                      Succeed: {stat.successfulCalls}
                    </span>
                    <span>•</span>
                    <span>Avg: {stat.avgScore}/rd</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-black text-base md:text-lg font-mono text-[var(--text-main)] text-glow-emerald">
                  {stat.totalScore.toFixed(1)}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                  pts
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {isGameComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 pt-4 border-t border-[var(--border-color)] space-y-3"
          id="leaderboard-footer"
        >
          <div className="flex items-start gap-2 bg-theme-success-bg border border-theme-success-border p-3 rounded-2xl text-[11px] text-theme-success">
            <Award className="w-4 h-4 shrink-0 text-theme-success mt-0.5" />
            <span className="uppercase tracking-wider font-semibold">5 rounds complete! Crown the ultimate winner.</span>
          </div>
          {onDeclareWinner && (
            <button
              onClick={onDeclareWinner}
              id="btn-declare-winner-lb"
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-brand-from to-brand-to text-brand-text font-extrabold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-theme-success/10 hover:shadow-xl hover:shadow-theme-success/20 transition-all cursor-pointer active:scale-95"
            >
              <Crown className="w-4 h-4 fill-current animate-bounce" />
              <span>Declare Winner</span>
            </button>
          )}
        </motion.div>
      ) : (
        <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center gap-2 text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-theme-success" />
          <span>Record all 5 rounds to declare.</span>
        </div>
      )}
    </div>
  );
}
