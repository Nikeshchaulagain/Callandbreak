import React from 'react';
import { Player, RoundData } from '../types';
import { Edit2, Lock, Sparkles, Check } from 'lucide-react';

interface ScoreTableProps {
  players: Player[];
  rounds: RoundData[];
  onEditRound: (roundNumber: number) => void;
}

export default function ScoreTable({ players, rounds, onEditRound }: ScoreTableProps) {
  
  // Helper to calculate total score for a player
  const calculatePlayerTotal = (playerId: string) => {
    return rounds.reduce((total, round) => {
      if (round.isLocked) {
        const playerScore = round.playersData[playerId]?.score || 0;
        return total + playerScore;
      }
      return total;
    }, 0);
  };

  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl overflow-hidden relative transition-colors duration-250" id="scoreboard-table-container">
      {/* Decorative background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_40%,_var(--bg-main)_120%)] pointer-events-none opacity-40"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 gap-4 border-b border-[var(--border-color)]">
        <div>
          <h2 className="text-xl font-bold font-display text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
            Game Scorecard
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wide">
            Tap any round column or cell to edit and record scores.
          </p>
        </div>
        
        {/* Help Badge on CallBreak Scoring */}
        <div className="flex flex-wrap items-center gap-2 bg-theme-success-bg border border-theme-success-border px-4 py-1.5 rounded-xl text-xs text-[var(--text-semi-muted)]">
          <span className="font-semibold text-theme-success uppercase tracking-widest text-[9px]">Scoring Model:</span>
          <span className="font-mono text-[11px] text-theme-success">Success = Call + Over × 0.1</span>
          <span className="text-[var(--border-color)]">|</span>
          <span className="font-mono text-[11px] text-theme-danger">Fail = -Call</span>
        </div>
      </div>

      <div className="relative z-10 overflow-x-auto mt-6 -mx-6 px-6">
        <table className="w-full min-w-[700px] border-collapse" id="callbreak-scorecard-table">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[11px] uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-input)]">
              <th className="py-4 text-left font-semibold text-[var(--text-muted)] px-6 w-[120px] md:w-[160px]">
                Active Player
              </th>
              {rounds.map(round => (
                <th
                  key={round.roundNumber}
                  onClick={() => onEditRound(round.roundNumber)}
                  className="py-4 text-center font-bold text-xs uppercase tracking-wider cursor-pointer group hover:bg-theme-success-bg/10 transition-all rounded-xl relative"
                  id={`header-round-${round.roundNumber}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[var(--text-semi-muted)] group-hover:text-theme-success transition-colors font-mono">
                      Round {round.roundNumber}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      round.isLocked 
                        ? 'bg-theme-success-bg text-theme-success border border-theme-success-border' 
                        : 'bg-[var(--btn-secondary-bg)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}>
                      {round.isLocked ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </>
                      ) : (
                        <span>Open</span>
                      )}
                    </span>
                    {/* Hover state overlay indicator */}
                    <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 text-theme-success transition-opacity">
                      <Edit2 className="w-3 h-3" />
                    </div>
                  </div>
                </th>
              ))}
              <th className="py-4 text-right font-extrabold text-theme-success tracking-wider bg-theme-success-bg/20 shadow-inner w-[100px] rounded-tr-xl px-6">
                Total Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {players.map((player) => {
              const totalScore = calculatePlayerTotal(player.id);
              
              return (
                <tr
                  key={player.id}
                  className="hover:bg-[var(--bg-hover)] transition-colors"
                  id={`scorecard-row-${player.id}`}
                >
                  {/* Player Name cell */}
                  <td className="py-5 px-6 font-bold text-theme-success text-sm md:text-base">
                    <span>{player.name}</span>
                  </td>

                  {/* 5 Round Cells */}
                  {rounds.map(round => {
                    const cellData = round.playersData[player.id];
                    const isLocked = round.isLocked;

                    return (
                      <td
                        key={round.roundNumber}
                        onClick={() => onEditRound(round.roundNumber)}
                        className="py-4 text-center cursor-pointer hover:bg-[var(--bg-hover-heavy)] transition-colors group"
                        id={`cell-${player.id}-rd${round.roundNumber}`}
                      >
                        {isLocked && cellData ? (
                          <div className="inline-flex flex-col items-center">
                            {/* Score Display */}
                            <span className={`text-base font-bold font-mono ${
                              cellData.score >= 0 
                                ? 'text-theme-success text-glow-emerald' 
                                : 'text-theme-danger'
                            }`}>
                              {cellData.score > 0 ? `+${cellData.score.toFixed(1)}` : cellData.score.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] mt-1 font-mono tracking-wide">
                              Bid {cellData.bid} • Tricks {cellData.tricks}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-2 h-10 justify-center">
                            <span className="text-[var(--text-muted)] opacity-50 font-mono text-sm group-hover:hidden">—</span>
                            <span className="hidden group-hover:inline-flex items-center gap-1 text-[10px] text-theme-success font-bold bg-theme-success-bg border border-theme-success-border px-2 py-1 rounded">
                              <Edit2 className="w-2.5 h-2.5 text-theme-success" />
                              <span className="uppercase tracking-widest">Record</span>
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Grand total Points Column */}
                  <td className="py-5 px-6 text-right font-black text-base md:text-lg font-mono bg-theme-success-bg/20 text-theme-success shadow-inner">
                    <span>
                      {totalScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Instructions */}
      <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center justify-between text-xs border-t border-[var(--border-color)] pt-4 gap-3 bg-[var(--bg-hover)] p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Lock className="w-3.5 h-3.5 text-theme-success" />
          <span>Locked indicators confirm accurate math. Tap a round cell at any time.</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-theme-accent uppercase tracking-widest text-[10px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>5-round limit strict validation.</span>
        </div>
      </div>
    </div>
  );
}
