"use client";

import { useEffect, useRef } from "react";
import { Mark } from "@/components/Mark";
import {
  boardsWon,
  moveLabel,
  statusText,
  type GameState,
  type Mark as PlayerMark,
} from "@/lib/game";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function PlayerCard({
  player,
  state,
}: {
  player: PlayerMark;
  state: GameState;
}) {
  const active = !state.winner && state.current === player;
  const won = boardsWon(state, player);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
        active ? "bg-white/[0.06] shadow-[inset_3px_0_0_#81b64c]" : "bg-black/20",
      )}
    >
      <div
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-md",
          player === "X" ? "bg-[#3a3834] text-mark-x" : "bg-[#2d3a24] text-mark-o",
        )}
      >
        <Mark player={player} className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold tracking-tight">Player {player}</p>
          {active && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              To move
            </span>
          )}
          {state.winner === player && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#e2c15a]">
              Winner
            </span>
          )}
        </div>
        <p className="text-xs text-muted">
          {won} {won === 1 ? "board" : "boards"} won
        </p>
      </div>
    </div>
  );
}

export function SidePanel({
  state,
  onNewGame,
}: {
  state: GameState;
  onNewGame: () => void;
}) {
  const endRef = useRef<HTMLLIElement>(null);
  const rows: Array<{ n: number; x?: (typeof state.moves)[number]; o?: (typeof state.moves)[number] }> =
    [];

  for (let i = 0; i < state.moves.length; i += 2) {
    rows.push({
      n: i / 2 + 1,
      x: state.moves[i],
      o: state.moves[i + 1],
    });
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [state.moves.length]);

  return (
    <aside className="flex min-h-[480px] flex-col gap-3 rounded-xl bg-panel p-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:min-h-0">
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          Pass & Play
        </p>
        <p className="font-mono text-xs text-muted">{state.moves.length} moves</p>
      </div>

      <PlayerCard player="O" state={state} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-black/25">
        <div className="flex items-baseline justify-between px-3 py-2">
          <h2 className="text-sm font-semibold">Moves</h2>
          <p className="text-[10px] uppercase tracking-wider text-muted">board / cell</p>
        </div>
        <p
          className="border-y border-white/5 px-3 py-2 text-sm leading-5 text-[#ddd9d0]"
          aria-live="polite"
        >
          {statusText(state)}
        </p>
        <ol className="history-scroll min-h-40 flex-1 overflow-y-auto lg:min-h-0">
          {rows.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm leading-6 text-muted">
              No moves yet. Player X may start in any cell.
            </li>
          ) : (
            rows.map((row, index) => (
              <li
                key={row.n}
                ref={index === rows.length - 1 ? endRef : undefined}
                className="grid grid-cols-[2rem_1fr_1fr] items-center px-3 py-1.5 font-mono text-sm odd:bg-white/[0.03]"
              >
                <span className="text-muted">{row.n}.</span>
                <span className="text-mark-x">{row.x ? moveLabel(row.x) : ""}</span>
                <span className="text-mark-o">{row.o ? moveLabel(row.o) : ""}</span>
              </li>
            ))
          )}
        </ol>
      </div>

      <PlayerCard player="X" state={state} />

      {state.winner && (
        <div className="rounded-lg bg-[#81b64c]/12 px-3 py-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Game over
          </p>
          <p className="mt-1 text-lg font-semibold">
            {state.winner === "draw" ? "Draw" : `Player ${state.winner} wins`}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onNewGame}
        className="h-11 w-full rounded-md bg-accent text-sm font-bold tracking-wide text-[#1c2114] transition hover:bg-[#95c85e] active:translate-y-px"
      >
        New Game
      </button>
      <p className="px-1 text-center text-[11px] leading-4 text-muted">
        A mark in a cell sends the opponent to that same spot on the big board.
        A won or drawn mini-board lets them play anywhere still open.
      </p>
    </aside>
  );
}
