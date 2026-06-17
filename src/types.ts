export interface Player {
  id: string;
  name: string;
}

export interface RoundPlayerEntry {
  bid: number; // 1 to 13
  tricks: number; // 0 to 13
  score: number; // calculated: tricks >= bid ? bid + (tricks - bid) * 0.1 : -bid
}

export interface RoundData {
  roundNumber: number; // 1 to 5
  playersData: {
    [playerId: string]: RoundPlayerEntry;
  };
  isLocked: boolean; // whether this round is confirmed/saved
}

export type GameState = 'setup' | 'playing' | 'declared';

export interface PlayerStats {
  id: string;
  name: string;
  totalScore: number;
  avgScore: number;
  highestRound: number;
  lowestRound: number;
  successfulCalls: number;
  failedCalls: number;
  rank?: number;
}
