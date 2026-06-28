import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, AlertTriangle, Users, BookOpen, Flame, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { Player, RoundData, GameState } from './types';
import { audioSystem } from './utils/audio';
import SetupScreen from './components/SetupScreen';
import ScoreTable from './components/ScoreTable';
import Leaderboard from './components/Leaderboard';
import WinnerScreen from './components/WinnerScreen';
import RoundEntryModal from './components/RoundEntryModal';

const STORAGE_KEYS = {
  PLAYERS: 'callbreak_players',
  ROUNDS: 'callbreak_rounds',
  GAME_STATE: 'callbreak_gameState',
};

const createEmptyRoundsCount = (length: number): RoundData[] =>
  Array.from({ length }, (_, i) => ({
    roundNumber: i + 1,
    playersData: {},
    isLocked: false,
  }));

export default function App() {
  const [muted, setMuted] = useState(audioSystem.isMuted());

  const toggleMute = () => {
    const isNowMuted = audioSystem.toggleMuted();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      audioSystem.playClick();
    }
  };

  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load initial players:', e);
      return [];
    }
  });

  const [rounds, setRounds] = useState<RoundData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUNDS);
      return saved ? JSON.parse(saved) : createEmptyRoundsCount(5);
    } catch (e) {
      console.error('Failed to load initial rounds:', e);
      return createEmptyRoundsCount(5);
    }
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      return saved ? (saved as GameState) : 'setup';
    } catch (e) {
      console.error('Failed to load initial gameState:', e);
      return 'setup';
    }
  });

  const [activeRoundNumber, setActiveRoundNumber] = useState<number | null>(null);
  
  // Dialog state for resetting confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetType, setResetType] = useState<'soft' | 'hard'>('soft');
  
  // Tutorial panel toggle
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Save to LocalStorage
  const saveState = (currentPlayers: Player[], currentRounds: RoundData[], currentState: GameState) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(currentPlayers));
      localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(currentRounds));
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, currentState);
    } catch (e) {
      console.error('Error saving local state', e);
    }
  };

  const handleStartGame = (newPlayers: Player[]) => {
    audioSystem.playSuccess();
    const freshRounds = createEmptyRoundsCount(5);
    setPlayers(newPlayers);
    setRounds(freshRounds);
    setGameState('playing');
    saveState(newPlayers, freshRounds, 'playing');
  };

  const handleSaveRoundScores = (roundNumber: number, roundPlayersData: any) => {
    audioSystem.playSuccess();
    const updatedRounds = rounds.map(r => {
      if (r.roundNumber === roundNumber) {
        return {
          ...r,
          playersData: roundPlayersData,
          isLocked: true,
        };
      }
      return r;
    });
    setRounds(updatedRounds);
    saveState(players, updatedRounds, gameState);
  };

  const handleOpenRoundEdit = (roundNo: number) => {
    audioSystem.playClick();
    setActiveRoundNumber(roundNo);
  };

  const handleDeclareWinner = () => {
    audioSystem.playCelebration();
    setGameState('declared');
    saveState(players, rounds, 'declared');
  };

  const initiateReset = (type: 'soft' | 'hard') => {
    audioSystem.playClick();
    setResetType(type);
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    audioSystem.playSuccess();
    setShowResetConfirm(false);
    if (resetType === 'soft') {
      // Soft reset: Rematch with the same players
      const freshRounds = createEmptyRoundsCount(5);
      setRounds(freshRounds);
      setGameState('playing');
      saveState(players, freshRounds, 'playing');
    } else {
      // Hard reset: Boot back to configuration panel
      setPlayers([]);
      const freshRounds = createEmptyRoundsCount(5);
      setRounds(freshRounds);
      setGameState('setup');
      saveState([], freshRounds, 'setup');
    }
  };

  // Check if all 5 rounds have been completed (locked)
  const isGameComplete = rounds.every(r => r.isLocked);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-theme-success-bg selection:text-theme-success pb-12 transition-colors duration-250" id="app-wrapper">
      {/* Navbar layout */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-header)] backdrop-blur-md sticky top-0 z-30 shadow-2xl transition-colors duration-250" id="app-header">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-from to-brand-to text-brand-text flex items-center justify-center font-black text-sm uppercase tracking-wider shadow-lg" id="header-logo">
              CB
            </span>
            <div>
              <h1 className="font-extrabold text-base tracking-widest font-display text-[var(--text-main)] uppercase">
                NIKESH CALLBREAK
              </h1>
              <p className="text-[9px] text-[var(--text-muted)] font-mono tracking-widest uppercase">
                Interactive Score Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sound Toggle Button */}
            <button
              onClick={toggleMute}
              id="btn-toggle-sound"
              aria-label="Toggle sound effects"
              className="flex items-center justify-center p-2.5 border border-[var(--border-color)] bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] rounded-xl text-[var(--text-semi-muted)] hover:text-[var(--text-main)] cursor-pointer transition-all active:scale-90"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" /> : <Volume2 className="w-4 h-4 text-theme-success" />}
            </button>

            {/* Guide Button */}
            <button
              onClick={() => {
                audioSystem.playClick();
                setShowHowToPlay(!showHowToPlay);
              }}
              id="btn-toggle-guide"
              className="flex items-center gap-1.5 px-3.5 py-2 border border-[var(--border-color)] bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] rounded-xl text-[var(--text-semi-muted)] hover:text-[var(--text-main)] text-xs font-bold cursor-pointer transition-all uppercase tracking-wider"
            >
              <BookOpen className="w-4 h-4 text-theme-success" />
              <span className="hidden sm:inline">How To Play</span>
            </button>

            {gameState !== 'setup' && (
              <button
                onClick={() => initiateReset('hard')}
                id="btn-header-reset"
                className="px-3.5 py-2 text-theme-danger hover:bg-theme-danger-bg border border-theme-danger-border rounded-xl text-xs font-bold cursor-pointer transition-all uppercase tracking-wider"
              >
                Reset Match
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="max-w-7xl mx-auto px-6 mt-8" id="app-main-content">
        
        {/* Help Screen Accordion / Alert */}
        <AnimatePresence>
          {showHowToPlay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
              id="how-to-play-drawer"
            >
              <div className="bg-[var(--bg-input)] border border-[var(--border-color)] p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-[var(--text-main)] text-sm flex items-center gap-2 uppercase tracking-widest text-[11px]">
                    <HelpCircle className="w-5 h-5 text-theme-success" />
                    How CallBreak scoring Works
                  </h3>
                  <button
                    onClick={() => setShowHowToPlay(false)}
                    className="text-theme-success hover:text-theme-success/80 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Hide [x]
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[var(--text-semi-muted)]">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[var(--text-main)] uppercase tracking-wider">1. The Bid call</h4>
                    <p className="leading-relaxed text-[var(--text-muted)]">
                      Players announce their projected trick wins from 1 to 13 before actual trickplay commences.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-[var(--text-main)] uppercase tracking-wider">2. Score formulation</h4>
                    <p className="leading-relaxed text-[var(--text-muted)]">
                      - **Match / Exceed**: Earn points equivalent to call. Excess wins value at 0.1 points each.
                      <br/>
                      - **Under**: Fail leads to subtraction equal to your call.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-[var(--text-main)] uppercase tracking-wider">3. 13-tricks integrity</h4>
                    <p className="leading-relaxed text-[var(--text-muted)]">
                      Since total deck values distribute to 4 hands, the exact sum of wins cannot exceed 13 items.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Router */}
        <div id="game-view-router" className="relative z-10">
          {gameState === 'setup' && (
            <SetupScreen onStartGame={handleStartGame} />
          )}

          {gameState === 'playing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" id="playing-layout-grid">
              
              {/* Scorecard Table Card (Player rows) */}
              <div className="lg:col-span-2">
                <ScoreTable
                  players={players}
                  rounds={rounds}
                  onEditRound={handleOpenRoundEdit}
                />
              </div>

              {/* Dynamic Live Rankings / Match Status Side Card */}
              <div className="lg:col-span-1">
                <Leaderboard
                  players={players}
                  rounds={rounds}
                  isGameComplete={isGameComplete}
                  onDeclareWinner={handleDeclareWinner}
                />
              </div>
            </div>
          )}

          {gameState === 'declared' && (
            <WinnerScreen
              players={players}
              rounds={rounds}
              onPlayAgainSame={() => initiateReset('soft')}
              onFullReset={() => initiateReset('hard')}
              onBackToGame={() => setGameState('playing')}
            />
          )}
        </div>
      </main>

      {/* Round Entry Modal Trigger */}
      {activeRoundNumber !== null && (
        <RoundEntryModal
          isOpen={activeRoundNumber !== null}
          onClose={() => setActiveRoundNumber(null)}
          roundNumber={activeRoundNumber}
          players={players}
          existingRoundData={rounds.find(r => r.roundNumber === activeRoundNumber) || null}
          onSaveRound={handleSaveRoundScores}
        />
      )}

      {/* Safety Dialog: Confirmation Modal for Resetting */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[var(--modal-bg)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-6"
              id="reset-confirm-modal"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-main)]">
                  Confirm Reset Action
                </h3>
              </div>
              
              <p className="text-xs text-[var(--text-muted)] leading-relaxed uppercase tracking-wide">
                {resetType === 'soft'
                  ? 'Are you sure you want to trigger a Rematch? This will clear all 5 rounds of bids and tricks but preserve your current 4 player names.'
                  : 'Are you sure you want to perform a Full Reset? This will completely clear all current scores, names, and statistics so you can configure fresh profiles.'}
              </p>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  id="btn-cancel-reset"
                  className="px-4 py-2.5 border border-[var(--border-color)] bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-semi-muted)] font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  id="btn-confirm-reset"
                  className="px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer active:scale-95"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
