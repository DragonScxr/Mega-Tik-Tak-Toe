"use client";

import { useState } from "react";
import { Board } from "@/components/Board";
import { SidePanel } from "@/components/SidePanel";
import { createGame, play, shortStatus, type GameState } from "@/lib/game";

export function Game() {
  const [state, setState] = useState<GameState>(() => createGame());

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 grid-cols-3 gap-0.5 rounded-md bg-[#1a1917] p-1.5" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
              <span key={index} className="rounded-[1px] bg-white/70" />
            ))}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              Ultimate
            </p>
            <h1 className="text-lg font-semibold leading-none tracking-tight">Tic-Tac-Toe</h1>
          </div>
        </div>
        <p className="hidden text-sm text-[#ddd9d0] sm:block">{shortStatus(state)}</p>
      </header>

      <main className="mx-auto grid w-full max-w-[1180px] flex-1 items-start gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_332px]">
        <section className="min-w-0">
          <p className="mb-3 text-center text-sm text-[#ddd9d0] sm:hidden">{shortStatus(state)}</p>
          <Board state={state} onMove={(board, cell) => setState((current) => play(current, board, cell))} />
        </section>
        <SidePanel state={state} onNewGame={() => setState(createGame())} />
      </main>
    </div>
  );
}
