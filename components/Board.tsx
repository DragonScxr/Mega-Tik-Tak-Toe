import { Mark } from "@/components/Mark";
import {
  canPlay,
  legalBoards,
  metaWinBoards,
  squareName,
  winningCells,
  type GameState,
} from "@/lib/game";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Board({
  state,
  onMove,
}: {
  state: GameState;
  onMove: (board: number, cell: number) => void;
}) {
  const legal = new Set(legalBoards(state));
  const winBoards = new Set(
    state.winner && state.winner !== "draw" ? metaWinBoards(state.boardResults) : [],
  );
  const soleTarget = legal.size === 1;

  return (
    <div className="mx-auto w-full max-w-[720px] select-none">
      <div className="rounded-xl bg-[#141311] p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.38)] sm:p-3.5">
        <div className="grid grid-cols-[1.1rem_1fr] grid-rows-[1.1rem_1fr] gap-1.5">
          <div />
          <div className="grid grid-cols-3 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            <span>a</span>
            <span>b</span>
            <span>c</span>
          </div>
          <div className="grid grid-rows-3 text-center font-mono text-[11px] text-muted">
            <span className="grid place-items-center">3</span>
            <span className="grid place-items-center">2</span>
            <span className="grid place-items-center">1</span>
          </div>
          <div
            className="grid grid-cols-3 gap-2 sm:gap-2.5"
            role="grid"
            aria-label="Ultimate tic-tac-toe board"
          >
            {state.cells.map((mini, board) => {
              const result = state.boardResults[board];
              const isLegal = legal.has(board);
              const isWin = winBoards.has(board);
              const wonCells = new Set(
                result === "X" || result === "O" ? winningCells(mini) : [],
              );

              return (
                <div
                  key={board}
                  role="row"
                  aria-label={`Mini-board ${squareName(board)}`}
                  className={cn(
                    "relative grid grid-cols-3 gap-1 rounded-md bg-[#2a2825] p-1 transition-opacity duration-200 sm:gap-1.5 sm:p-1.5",
                    isLegal && soleTarget && "active-board bg-[#31362b]",
                    isLegal &&
                      !soleTarget &&
                      "bg-[#31362b] shadow-[0_0_0_2px_#81b64c]",
                    !isLegal && !state.winner && "opacity-50",
                    isWin &&
                      "opacity-100 shadow-[0_0_0_2px_#e2c15a,0_0_22px_rgba(226,193,90,0.35)]",
                  )}
                >
                  {soleTarget && isLegal && (
                    <span className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-accent px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-[#1a1c14]">
                      Play
                    </span>
                  )}
                  {mini.map((value, cell) => {
                    const legalCell = canPlay(state, board, cell);
                    const isLast =
                      state.lastMove?.board === board &&
                      state.lastMove.cell === cell;
                    return (
                      <button
                        key={cell}
                        type="button"
                        role="gridcell"
                        disabled={!legalCell}
                        aria-label={`${squareName(board)} ${squareName(cell)}${value ? `, ${value}` : ", empty"}`}
                        onClick={() => onMove(board, cell)}
                        className={cn(
                          "relative aspect-square rounded-[3px] bg-[#3c3a36] transition-colors duration-150",
                          legalCell &&
                            "cursor-pointer hover:bg-[#524f49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                          !legalCell && "cursor-default",
                          isLast && "bg-[#6d5b32]",
                          wonCells.has(cell) && "bg-[#4d4634]",
                        )}
                      >
                        {value && (
                          <Mark
                            player={value}
                            className={cn(
                              "mark-in absolute inset-[16%] ",
                              value === "X" ? "text-mark-x" : "text-mark-o",
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                  {result === "X" || result === "O" ? (
                    <div className="overlay-in pointer-events-none absolute inset-0 z-10 grid place-items-center">
                      <div
                        className={cn(
                          "absolute inset-1 rounded-md",
                          result === "X" ? "bg-black/50" : "bg-black/55",
                        )}
                      />
                      <Mark
                        player={result}
                        className={cn(
                          "relative h-[72%] w-[72%] drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]",
                          result === "X" ? "text-mark-x" : "text-mark-o",
                        )}
                      />
                    </div>
                  ) : null}
                  {result === "draw" ? (
                    <div className="overlay-in pointer-events-none absolute inset-0 z-10 grid place-items-center">
                      <div className="absolute inset-1 rounded-md bg-black/55" />
                      <span className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8c4ba] sm:text-xs">
                        Draw
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] shadow-[0_0_0_2px_#81b64c]" />
          Legal mini-board
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-[#6d5b32]" />
          Last move
        </span>
      </div>
    </div>
  );
}
