
export enum GameMode {
  SEQUENCE = 'SEQUENCE',
  LOGIC = 'LOGIC',
  REVERSE = 'REVERSE'
}

export interface Puzzle {
  question: string;
  answer: string;
  sequence: number[];
  explanation: string;
  hints: string[];
}

export interface GameState {
  score: number;
  level: number;
  streak: number;
  mode: GameMode;
  isVibrating: boolean;
}
