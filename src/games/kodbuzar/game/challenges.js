import { allCodes, score, seededRandom } from './logic.js';

const config = { length: 3, alphabet: '12345', repeats: false };
const codes = allCodes(config);
const resultKey = ({ bulls, cows }) => `${bulls}:${cows}`;

export function largestGroup(candidates, guess) {
  const groups = new Map();
  for (const candidate of candidates) {
    const key = resultKey(score(candidate, guess));
    groups.set(key, (groups.get(key) || 0) + 1);
  }
  return Math.max(...groups.values());
}

function shuffle(values, random) {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function makeChallenges(seed) {
  const random = seededRandom(seed);
  const digits = shuffle(config.alphabet, random);
  const remap = (code) => [...code].map((digit) => digits[Number(digit) - 1]).join('');
  const secret = remap('231');
  const clue = (code) => {
    const guess = remap(code);
    return { guess, ...score(secret, guess) };
  };
  const evidence = [clue('124'), clue('234')];
  const first = evidence[0];
  const candidates = codes.filter((code) => resultKey(score(code, first.guess)) === resultKey(first));
  const guesses = ['213', '132', '123'].map(remap);
  const tradeoffs = Object.fromEntries(guesses.map((guess) => [guess, largestGroup(candidates, guess)]));
  const wrongGuess = clue('352');

  return {
    secret,
    evidence,
    tradeoffs,
    rounds: [
      { id: 'evidence', options: shuffle([secret, remap('312'), remap('235')], random), correct: secret },
      { id: 'best', options: shuffle(guesses, random), correct: guesses.reduce((best, guess) => tradeoffs[guess] < tradeoffs[best] ? guess : best) },
      {
        id: 'mistake',
        clues: shuffle([...evidence, { ...wrongGuess, bulls: 0, cows: 0 }], random),
        correct: wrongGuess.guess,
        actual: wrongGuess,
      },
    ],
  };
}
