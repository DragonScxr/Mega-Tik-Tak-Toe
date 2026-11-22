export type Mark = "X" | "O";
export type CellValue = Mark | null;
export type BoardResult = Mark | "draw" | null;

export interface Move {
  player: Mark;
  board: number;
  cell: number;
}

export interface GameState {
  cells: CellValue[][];
  boardResults: BoardResult[];
  current: Mark;
  /** Mini-board the current player must play in. Null means any open board. */
  activeBoard: number | null;
  /** Mini-board the previous move sent the current player toward. */
  sentTo: number | null;
  winner: BoardResult;
  moves: Move[];
  lastMove: { board: number; cell: number } | null;
}

export const LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const FILES = ["a", "b", "c"] as const;

/** Algebraic name, rank 3 on the top row, matching the on-screen grid. */
export function squareName(index: number): string {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return `${FILES[col]}${3 - row}`;
}

export function otherPlayer(player: Mark): Mark {
  return player === "X" ? "O" : "X";
}

export function createGame(): GameState {
  return {
    cells: Array.from({ length: 9 }, () => Array<CellValue>(9).fill(null)),
    boardResults: Array<BoardResult>(9).fill(null),
    current: "X",
    activeBoard: null,
    sentTo: null,
    winner: null,
    moves: [],
    lastMove: null,
  };
}

export function lineWinner(values: readonly (Mark | null)[]): Mark | null {
  for (const [a, b, c] of LINES) {
    const value = values[a];
    if (value && value === values[b] && value === values[c]) return value;
  }
  return null;
}

export function winningCells(values: readonly (Mark | null)[]): number[] {
  const cells = new Set<number>();
  for (const [a, b, c] of LINES) {
    const value = values[a];
    if (value && value === values[b] && value === values[c]) {
      cells.add(a);
      cells.add(b);
      cells.add(c);
    }
  }
  return [...cells];
}

export function boardOutcome(cells: readonly CellValue[]): BoardResult {
  const winner = lineWinner(cells);
  if (winner) return winner;
  if (cells.every((cell) => cell !== null)) return "draw";
  return null;
}

export function metaOutcome(results: readonly BoardResult[]): BoardResult {
  const marks = results.map((result) =>
    result === "X" || result === "O" ? result : null,
  );
  const winner = lineWinner(marks);
  if (winner) return winner;
  if (results.every((result) => result !== null)) return "draw";
  return null;
}

export function metaWinBoards(results: readonly BoardResult[]): number[] {
  const marks = results.map((result) =>
    result === "X" || result === "O" ? result : null,
  );
  return winningCells(marks);
}

export function isBoardOpen(result: BoardResult): boolean {
  return result === null;
}

export function canPlay(state: GameState, board: number, cell: number): boolean {
  if (state.winner) return false;
  if (board < 0 || board > 8 || cell < 0 || cell > 8) return false;
  if (!isBoardOpen(state.boardResults[board])) return false;
  if (state.cells[board][cell] !== null) return false;
  if (state.activeBoard !== null && state.activeBoard !== board) return false;
  return true;
}

export function legalBoards(state: GameState): number[] {
  if (state.winner) return [];
  const open = state.boardResults.flatMap((result, index) =>
    isBoardOpen(result) ? [index] : [],
  );
  if (state.activeBoard !== null) {
    return open.filter((index) => index === state.activeBoard);
  }
  return open;
}

export function play(state: GameState, board: number, cell: number): GameState {
  if (!canPlay(state, board, cell)) return state;

  const cells = state.cells.map((mini) => mini.slice());
  cells[board][cell] = state.current;

  const boardResults = state.boardResults.slice();
  boardResults[board] = boardOutcome(cells[board]);

  const winner = metaOutcome(boardResults);
  const destinationOpen = isBoardOpen(boardResults[cell]);

  return {
    cells,
    boardResults,
    current: otherPlayer(state.current),
    activeBoard: winner || !destinationOpen ? null : cell,
    sentTo: cell,
    winner,
    moves: [...state.moves, { player: state.current, board, cell }],
    lastMove: { board, cell },
  };
}

export function boardsWon(state: GameState, player: Mark): number {
  return state.boardResults.filter((result) => result === player).length;
}

export function statusText(state: GameState): string {
  if (state.winner === "draw") {
    return "Draw. Every mini-board is finished, and neither player has three in a row.";
  }
  if (state.winner === "X" || state.winner === "O") {
    return `Player ${state.winner} wins with three mini-boards in a row.`;
  }

  const who = `Player ${state.current}`;
  if (state.activeBoard !== null) {
    return `${who} to move in mini-board ${squareName(state.activeBoard)}.`;
  }
  if (state.sentTo !== null && !isBoardOpen(state.boardResults[state.sentTo])) {
    const closed =
      state.boardResults[state.sentTo] === "draw" ? "drawn" : "already won";
    return `${who} was sent to ${squareName(state.sentTo)}, which is ${closed}. Play in any open mini-board.`;
  }
  return `${who} to move. Play in any open mini-board.`;
}

export function shortStatus(state: GameState): string {
  if (state.winner === "draw") return "Draw";
  if (state.winner) return `Player ${state.winner} wins`;
  if (state.activeBoard !== null) {
    return `Player ${state.current} · ${squareName(state.activeBoard)}`;
  }
  return `Player ${state.current} · any open board`;
}

export function moveLabel(move: Move): string {
  return `${squareName(move.board)}/${squareName(move.cell)}`;
}
