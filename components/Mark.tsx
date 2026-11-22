import type { Mark as PlayerMark } from "@/lib/game";

export function Mark({
  player,
  className = "",
}: {
  player: PlayerMark;
  className?: string;
}) {
  if (player === "X") {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
        <path
          d="M24 24 L76 76 M76 24 L24 76"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
      />
    </svg>
  );
}
