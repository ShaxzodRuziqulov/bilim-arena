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
// Yakka rejim (bitta o'yinchi): xazinaga yetgan bo'lsa aniqlik bo'yicha 1–3 yulduz, yetmagan bo'lsa 0.
export const isSolo = (teams) => teams.length === 1;
export function soloStars(player, trackLength) {
  if (!player || player.pos < trackLength) return 0;
  const answered = player.correct + player.wrong;
  const accuracy = answered ? player.correct / answered : 0;
  return player.wrong === 0 ? 3 : accuracy >= 0.75 ? 2 : 1;
}
