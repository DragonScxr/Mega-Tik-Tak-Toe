"use client";

import { useEffect, useState } from "react";
import { Board } from "@/components/Board";
import { SidePanel } from "@/components/SidePanel";
import { BOTS, chooseBotMove, type BotDifficulty } from "@/lib/bot";
import { createGame, otherPlayer, play, shortStatus, type GameState, type Mark } from "@/lib/game";

type GameMode = "bot" | "local";

export function Game() {
  const [state, setState] = useState<GameState>(() => createGame());
  const [mode, setMode] = useState<GameMode>("bot");
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("club");
  const [playerMark, setPlayerMark] = useState<Mark>("X");
  const [botThinking, setBotThinking] = useState(false);

  const botMark = otherPlayer(playerMark);
  const activeBot = BOTS.find((b) => b.id === botDifficulty) ?? BOTS[0];
  const isBotTurn = mode === "bot" && !state.winner && state.current === botMark;

  useEffect(() => {
    if (!isBotTurn) {
      setBotThinking(false);
      return;
    }

    setBotThinking(true);
    const delay = botDifficulty === "grandmaster" ? 420 : 320;
    const timer = window.setTimeout(() => {
      setState((current) => {
        if (current.winner || current.current !== botMark) return current;
        const move = chooseBotMove(current, botDifficulty);
        if (!move) return current;
        return play(current, move.board, move.cell);
      });
      setBotThinking(false);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [isBotTurn, botDifficulty, botMark]);

  function startNewGame(nextMark: Mark = playerMark) {
    setPlayerMark(nextMark);
    setState(createGame());
  }

  function handleMove(board: number, cell: number) {
    if (isBotTurn) return;
    setState((current) => play(current, board, cell));
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-[#1a1917] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode("bot");
                startNewGame(playerMark);
              }}
              className={`rounded-md px-2.5 py-1 transition ${
                mode === "bot" ? "bg-[#81b64c] text-[#141311] font-semibold" : "text-[#b8b4ab] hover:text-white"
              }`}
            >
              Vs Bot
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("local");
                startNewGame(playerMark);
              }}
              className={`rounded-md px-2.5 py-1 transition ${
                mode === "local" ? "bg-[#81b64c] text-[#141311] font-semibold" : "text-[#b8b4ab] hover:text-white"
              }`}
            >
              Pass &amp; Play
            </button>
          </div>

          {mode === "bot" && (
            <>
              <div className="flex rounded-lg bg-[#1a1917] p-1 text-xs">
                {BOTS.map((bot) => (
                  <button
                    key={bot.id}
                    type="button"
                    onClick={() => {
                      setBotDifficulty(bot.id);
                      startNewGame(playerMark);
                    }}
                    title={bot.tagline}
                    className={`rounded-md px-2.5 py-1 transition ${
                      botDifficulty === bot.id
                        ? "bg-white/15 font-semibold text-white"
                        : "text-[#9c988f] hover:text-white"
                    }`}
                  >
                    {bot.name} <span className="opacity-70">({bot.rating})</span>
                  </button>
                ))}
              </div>

              <div className="flex rounded-lg bg-[#1a1917] p-1 text-xs">
                {(["X", "O"] as const).map((mark) => (
                  <button
                    key={mark}
                    type="button"
                    onClick={() => startNewGame(mark)}
                    className={`rounded-md px-2 py-1 font-semibold transition ${
                      playerMark === mark
                        ? "bg-white/15 text-white"
                        : "text-[#9c988f] hover:text-white"
                    }`}
                  >
                    Play {mark}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="hidden text-sm text-[#ddd9d0] xl:block">
          {botThinking ? `${activeBot.name} (${activeBot.rating}) is thinking…` : shortStatus(state)}
        </p>
      </header>

      <main className="mx-auto grid w-full max-w-[1180px] flex-1 items-start gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_332px]">
        <section className="min-w-0">
          <p className="mb-3 text-center text-sm text-[#ddd9d0] xl:hidden">
            {botThinking ? `${activeBot.name} (${activeBot.rating}) is thinking…` : shortStatus(state)}
          </p>
          <Board state={state} onMove={handleMove} />
        </section>
        <SidePanel state={state} onNewGame={() => startNewGame(playerMark)} />
      </main>
    </div>
  );
}
