export function roundFinished(teams, turn, trackLength) {
  return turn === teams.length - 1 && teams.some((team) => team.pos >= trackLength);
}
export function raceWinner(teams) {
  const ranked = [...teams].sort((a, b) => b.pos - a.pos || b.correct - a.correct);
  const first = ranked[0];
  if (!first || first.pos <= 0) return null;
  const second = ranked[1];
  return second && second.pos === first.pos && second.correct === first.correct ? null : first.name;
}
