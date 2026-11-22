import {
    LINES,
    canPlay,
    isBoardOpen,
    legalBoards,
    otherPlayer,
    play,
    type GameState,
    type Mark,
  } from "@/lib/game";
  
  export type BotDifficulty = "rookie" | "club" | "grandmaster";
  
  export interface BotProfile {
    id: BotDifficulty;
    name: string;
    rating: number;
    tagline: string;
  }
  
  export const BOTS: readonly BotProfile[] = [
    {
      id: "rookie",
      name: "Rookie",
      rating: 600,
      tagline: "Learns the ropes and occasionally misses threats.",
    },
    {
      id: "club",
      name: "Club Player",
      rating: 1350,
      tagline: "Blocks mini-boards and avoids gifting free moves.",
    },
    {
      id: "grandmaster",
      name: "Grandmaster",
      rating: 2200,
      tagline: "Simulates hundreds of future lines with MCTS.",
    },
  ];
  
  export interface CandidateMove {
    board: number;
    cell: number;
  }
  
  export function getLegalMoves(state: GameState): CandidateMove[] {
    if (state.winner) return [];
    const moves: CandidateMove[] = [];
    for (const board of legalBoards(state)) {
      for (let cell = 0; cell < 9; cell++) {
        if (canPlay(state, board, cell)) {
          moves.push({ board, cell });
        }
      }
    }
    return moves;
  }
  
  function createsTwoInARow(
    cells: readonly (Mark | null)[],
    index: number,
    player: Mark,
  ): boolean {
    for (const [a, b, c] of LINES) {
      if (a !== index && b !== index && c !== index) continue;
      const line = [a, b, c].map((i) => (i === index ? player : cells[i]));
      const own = line.filter((v) => v === player).length;
      const empty = line.filter((v) => v === null).length;
      if (own === 2 && empty === 1) return true;
    }
    return false;
  }
  
  function scoreMoveTactically(
    state: GameState,
    move: CandidateMove,
    botMark: Mark,
  ): number {
    const opp = otherPlayer(botMark);
    const next = play(state, move.board, move.cell);
    let score = 0;
  
    if (next.winner === botMark) return 100000;
  
    if (next.boardResults[move.board] === botMark) {
      score += 120;
      if (move.board === 4) score += 45;
      else if (move.board === 0 || move.board === 2 || move.board === 6 || move.board === 8) {
        score += 25;
      }
      if (createsTwoInARow(state.boardResults.map((r) => (r === "X" || r === "O" ? r : null)), move.board, botMark)) {
        score += 180;
      }
    }
  
    const oppTest = play({ ...state, current: opp }, move.board, move.cell);
    if (oppTest.boardResults[move.board] === opp) {
      score += 95;
    }
  
    if (createsTwoInARow(state.cells[move.board], move.cell, botMark)) {
      score += 28;
    }
  
    if (move.cell === 4) score += 14;
    else if (move.cell === 0 || move.cell === 2 || move.cell === 6 || move.cell === 8) {
      score += 8;
    }
  
    if (!isBoardOpen(next.boardResults[move.cell])) {
      score -= 85;
    } else {
      const oppMoves = getLegalMoves(next);
      const oppCanWinMini = oppMoves.some(
        (m) => play(next, m.board, m.cell).boardResults[m.board] === opp,
      );
      if (oppCanWinMini) score -= 70;
    }
  
    return score + Math.random() * 12;
  }
  
  function fastPlayout(startState: GameState, botMark: Mark): number {
    let sim = startState;
    let depth = 0;
    while (!sim.winner && depth < 65) {
      const moves = getLegalMoves(sim);
      if (moves.length === 0) break;
  
      let chosen = moves[Math.floor(Math.random() * moves.length)];
      for (let i = 0; i < Math.min(3, moves.length); i++) {
        const candidate = moves[Math.floor(Math.random() * moves.length)];
        const after = play(sim, candidate.board, candidate.cell);
        if (after.winner === sim.current || after.boardResults[candidate.board] === sim.current) {
          chosen = candidate;
          break;
        }
      }
  
      sim = play(sim, chosen.board, chosen.cell);
      depth++;
    }
  
    if (sim.winner === botMark) return 1;
    if (sim.winner === otherPlayer(botMark)) return 0;
    return 0.5;
  }
  
  function chooseMctsMove(
    state: GameState,
    botMark: Mark,
    simulations: number,
  ): CandidateMove {
    const moves = getLegalMoves(state);
    if (moves.length === 1) return moves[0];
  
    for (const m of moves) {
      if (play(state, m.board, m.cell).winner === botMark) return m;
    }
  
    const stats = moves.map((move) => ({
      move,
      visits: 0,
      wins: 0,
      prior: Math.max(1, scoreMoveTactically(state, move, botMark) + 150),
    }));
  
    for (let i = 0; i < simulations; i++) {
      let bestIdx = 0;
      let bestUcb = -Infinity;
      const logTotal = Math.log(i + 1);
  
      for (let j = 0; j < stats.length; j++) {
        const s = stats[j];
        const ucb =
          s.visits === 0
            ? 1000 + s.prior
            : s.wins / s.visits + 1.35 * Math.sqrt(logTotal / s.visits);
        if (ucb > bestUcb) {
          bestUcb = ucb;
          bestIdx = j;
        }
      }
  
      const picked = stats[bestIdx];
      const nextState = play(state, picked.move.board, picked.move.cell);
      const result = fastPlayout(nextState, botMark);
      picked.visits += 1;
      picked.wins += result;
    }
  
    stats.sort((a, b) => b.visits - a.visits);
    return stats[0].move;
  }
  
  export function chooseBotMove(
    state: GameState,
    difficulty: BotDifficulty,
  ): CandidateMove | null {
    const moves = getLegalMoves(state);
    if (moves.length === 0) return null;
    const botMark = state.current;
  
    if (difficulty === "rookie") {
      if (Math.random() < 0.65) {
        return moves[Math.floor(Math.random() * moves.length)];
      }
      const scored = moves
        .map((m) => ({ m, s: scoreMoveTactically(state, m, botMark) }))
        .sort((a, b) => b.s - a.s);
      return scored[0].m;
    }
  
    if (difficulty === "club") {
      const scored = moves
        .map((m) => ({ m, s: scoreMoveTactically(state, m, botMark) }))
        .sort((a, b) => b.s - a.s);
      return scored[0].m;
    }
  
    return chooseMctsMove(state, botMark, 850);
  }
  