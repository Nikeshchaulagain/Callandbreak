import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, AlertTriangle, AlertCircle, Plus, Minus } from 'lucide-react';
import { Player, RoundPlayerEntry, RoundData } from '../types';
import { audioSystem } from '../utils/audio';

interface RoundEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundNumber: number;
  players: Player[];
  existingRoundData: RoundData | null;
  onSaveRound: (roundNumber: number, data: { [playerId: string]: RoundPlayerEntry }) => void;
}

export default function RoundEntryModal({
  isOpen,
  onClose,
  roundNumber,
  players,
  existingRoundData,
  onSaveRound
}: RoundEntryModalProps) {
  // Local state for each player's bids and tricks won
  const [bids, setBids] = useState<{ [playerId: string]: number }>({});
  const [tricks, setTricks] = useState<{ [playerId: string]: number }>({});
  
  useEffect(() => {
    if (isOpen) {
      const initialBids: { [playerId: string]: number } = {};
      const initialTricks: { [playerId: string]: number } = {};
      
      players.forEach(player => {
        const savedData = existingRoundData?.playersData[player.id];
        initialBids[player.id] = savedData ? savedData.bid : 2; // Default bid 2
        initialTricks[player.id] = savedData ? savedData.tricks : 2; // Default tricks 2
      });
      
      setBids(initialBids);
      setTricks(initialTricks);
    }
  }, [isOpen, roundNumber, players, existingRoundData]);

  if (!isOpen) return null;

  // Calculate scores on-the-fly for preview
  const calculatePlayerScore = (playerId: string) => {
    const b = bids[playerId] || 1;
    const t = tricks[playerId] || 0;
    if (t >= b) {
      // Made bid. Over-tricks count as 0.1 each.
      return Number((b + (t - b) * 0.1).toFixed(1));
    } else {
      // Failed bid. Scores negative bid.
      return Number((-b).toFixed(1));
    }
  };

  const totalTricksWon = (Object.values(tricks) as number[]).reduce((acc, curr) => acc + (curr || 0), 0);
  const isValid = totalTricksWon <= 13;

  const handleAdjustBid = (playerId: string, delta: number) => {
    audioSystem.playScoreChange();
    setBids(prev => {
      const current = prev[playerId] || 1;
      const newVal = Math.max(1, Math.min(13, current + delta));
      return { ...prev, [playerId]: newVal };
    });
  };

  const handleAdjustTricks = (playerId: string, delta: number) => {
    audioSystem.playScoreChange();
    setTricks(prev => {
      const current = prev[playerId] || 0;
      const newVal = Math.max(0, Math.min(13, current + delta));
      return { ...prev, [playerId]: newVal };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const formattedData: { [playerId: string]: RoundPlayerEntry } = {};
    players.forEach(player => {
      const b = bids[player.id];
      const t = tricks[player.id];
      const s = calculatePlayerScore(player.id);
      formattedData[player.id] = {
        bid: b,
        tricks: t,
        score: s
      };
    });

    onSaveRound(roundNumber, formattedData);
    onClose();
  };

  const handleFillQuickScores = () => {
    audioSystem.playClick();
    // Fill sample values that total exactly 13 tricks to demonstrate
    const sampleTricks = [4, 3, 3, 3];
    const sampleBids = [3, 3, 2, 3];
    const updatedBids: { [playerId: string]: number } = {};
    const updatedTricks: { [playerId: string]: number } = {};
    players.forEach((player, idx) => {
      updatedBids[player.id] = sampleBids[idx];
      updatedTricks[player.id] = sampleTricks[idx];
    });
    setBids(updatedBids);
    setTricks(updatedTricks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-[var(--modal-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative transition-colors duration-250"
        id="round-entry-modal"
      >
        {/* Decorative background glows */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-theme-success-bg/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-5 bg-[var(--bg-input)] border-b border-[var(--border-color)]">
          <div>
            <h3 className="font-extrabold text-base uppercase tracking-wider font-display text-[var(--text-main)] flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-brand-from to-brand-to text-brand-text font-black font-mono text-sm">
                R{roundNumber}
              </span>
              Round {roundNumber} Score Inputs
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wide">
              Adjust BID Call and Tricks Made for current active hand.
            </p>
          </div>
          <button
            onClick={onClose}
            id="close-entry-modal-btn"
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map(player => {
              const currentBid = bids[player.id] || 1;
              const currentTricks = tricks[player.id] || 0;
              const currentScore = calculatePlayerScore(player.id);
              const isMade = currentTricks >= currentBid;

               return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isMade 
                      ? 'bg-theme-success-bg border-theme-success-border/50 shadow-[0_0_15px_rgba(16,185,129,0.02)]' 
                      : 'bg-theme-danger-bg border-theme-danger-border/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-2.5">
                    <span className="font-bold text-[var(--text-main)] text-sm">
                      {player.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">Estimate:</span>
                      <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded ${
                        isMade 
                          ? 'bg-theme-success-bg text-theme-success border border-theme-success-border' 
                          : 'bg-theme-danger-bg text-theme-danger border border-theme-danger-border'
                       }`}>
                        {currentScore > 0 ? `+${currentScore.toFixed(1)}` : currentScore.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Bid / Call */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                        Call (Bid)
                      </label>
                      <div className="flex items-center bg-[var(--bg-input)] rounded-xl p-1 border border-[var(--border-color)]">
                        <button
                          type="button"
                          onClick={() => handleAdjustBid(player.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] rounded-lg cursor-pointer transition-all active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex-1 text-center font-black font-mono text-[var(--text-main)] text-sm">
                          {currentBid}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustBid(player.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] rounded-lg cursor-pointer transition-all active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Tricks Won */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                        Tricks Made
                      </label>
                      <div className="flex items-center bg-[var(--bg-input)] rounded-xl p-1 border border-[var(--border-color)]">
                        <button
                          type="button"
                          onClick={() => handleAdjustTricks(player.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] rounded-lg cursor-pointer transition-all active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex-1 text-center font-black font-mono text-[var(--text-main)] text-sm">
                          {currentTricks}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustTricks(player.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] rounded-lg cursor-pointer transition-all active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation Alert */}
          <div className="p-4 rounded-2xl border flex items-start gap-3 transition-colors bg-[var(--bg-hover)] border-[var(--border-color)]">
            <div className={`p-2 rounded-xl mt-0.5 ${
              isValid 
                ? 'bg-theme-success-bg text-theme-success border border-theme-success-border' 
                : 'bg-theme-danger-bg text-theme-danger border border-theme-danger-border'
            }`}>
              {isValid ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4 animate-bounce" />}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <h4 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">
                  Tricks Verification State
                </h4>
                <span className={`font-mono font-black text-xs ${isValid ? 'text-theme-success' : 'text-theme-danger'}`}>
                  {totalTricksWon} / 13 TOTAL TRICKS
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed uppercase tracking-wide">
                {isValid
                  ? "Valid setup! CallBreak tricks summation must be less than or equal to 13."
                  : "Calculation overflow! Complete summation of won tricks exceeds 13 tricks. Please reduce made values."}
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="relative z-10 px-6 py-4 bg-[var(--bg-input)] border-t border-[var(--border-color)] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleFillQuickScores}
            id="fill-demo-scores-btn"
            className="text-[10px] font-bold text-theme-success hover:bg-theme-success-bg/20 border border-theme-success-border px-3 py-2 rounded-xl transition-all uppercase tracking-widest cursor-pointer"
          >
            Auto Demo Fill
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              id="cancel-modal-btn"
              className="px-4 py-2.5 border border-[var(--border-color)] bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-semi-muted)] font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isValid}
              onClick={handleSave}
              id="save-round-scores-btn"
              className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl text-xs uppercase tracking-widest transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-brand-from to-brand-to text-brand-text shadow-lg shadow-theme-success/10 hover:shadow-xl hover:shadow-theme-success/20 cursor-pointer active:scale-95'
                  : 'bg-[var(--btn-secondary-bg)] text-[var(--text-muted)]/50 border border-[var(--border-color)] cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3px]" />
              <span>Confirm Scores</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
