import test from 'node:test';
import assert from 'node:assert/strict';
import { largestGroup, makeChallenges } from '../src/games/kodbuzar/game/challenges.js';
import { allCodes, score } from '../src/games/kodbuzar/game/logic.js';

const codes = allCodes({ length: 3, alphabet: '12345', repeats: false });
const matches = (candidate, clue) => {
  const result = score(candidate, clue.guess);
  return result.bulls === clue.bulls && result.cows === clue.cows;
};

test('Mantiq sinovida har vazifaning yagona to‘g‘ri javobi bor', () => {
  const secrets = new Set();
  for (let seed = 0; seed < 120; seed++) {
    const { secret, evidence, rounds } = makeChallenges(seed);
    const [findCode, bestGuess, findMistake] = rounds;
    secrets.add(secret);

    assert.deepEqual(codes.filter((code) => evidence.every((clue) => matches(code, clue))), [secret]);
    assert.equal(findCode.options.filter((code) => code === secret).length, 1);

    const candidates = codes.filter((code) => matches(code, evidence[0]));
    const scores = bestGuess.options.map((guess) => largestGroup(candidates, guess));
    assert.ok(candidates.length > 1);
    assert.equal(scores.filter((value) => value === Math.min(...scores)).length, 1);
    assert.equal(largestGroup(candidates, bestGuess.correct), Math.min(...scores));

    assert.deepEqual(findMistake.clues.filter((clue) => !matches(secret, clue)).map((clue) => clue.guess), [findMistake.correct]);
    assert.ok(matches(secret, findMistake.actual));
  }
  assert.ok(secrets.size > 1);
});
