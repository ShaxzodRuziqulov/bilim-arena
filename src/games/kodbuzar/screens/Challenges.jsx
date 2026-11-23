import { useState } from 'react';
import { makeChallenges } from '../game/challenges.js';
import { sfx } from '../game/sound.js';

const lessons = {
  evidence: ['Tayyor dalil', 'Ikki oldingi taxminni tekshiring. Qaysi kod ikkala dalilga ham mos?'],
  best: ['Eng foydali taxmin', 'Faqat quyidagi dalilni hisobga oling. Qaysi taxmin eng yomon holatda ham eng kam variant qoldiradi?'],
  mistake: ['Xatoni toping', 'Yashirin kod berilgan. Kalitjonning qaysi qatori bu kodga mos kelmaydi?'],
};
const newRound = () => makeChallenges(Math.random() * 0x100000000 >>> 0);
const describe = ({ bulls, cows }) => `${bulls} ta joyida · ${cows} ta boshqa joyda`;

export default function Challenges({ onBack }) {
  const [puzzle, setPuzzle] = useState(newRound);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState(null);
  const round = puzzle.rounds[step];
  const correct = answer === round?.correct;
  const complete = step === puzzle.rounds.length;

  const choose = (value) => {
    if (correct) return;
    setAnswer(value);
    if (value === round.correct) sfx.win();
    else sfx.error();
  };
  const next = () => {
    setAnswer(null);
    setStep((value) => value + 1);
  };
  const restart = () => {
    setPuzzle(newRound());
    setStep(0);
    setAnswer(null);
  };

  return (
    <div className="screen kb-challenge">
      <header className="kb-challenge-head">
        <button className="btn" onClick={onBack}>← Kodbuzar</button>
        <span>{Math.min(step + 1, puzzle.rounds.length)} / {puzzle.rounds.length}</span>
      </header>
      {complete ? (
        <>
          <h1>Uchta vazifa bajarildi!</h1>
          <button className="btn primary" onClick={restart}>Yangi kodlar bilan o‘ynash</button>
        </>
      ) : (
        <>
          <h1>{lessons[round.id][0]}</h1>
          <p>{lessons[round.id][1]}</p>
          <p className="challenge-rule">Joyida — raqam o‘z o‘rnida. Boshqa joyda — raqam kodda bor, ammo o‘rni boshqa.</p>
          <p className="challenge-rule">Kod 1 dan 5 gacha bo‘lgan uchta har xil raqamdan tuzilgan.</p>
          {round.id === 'mistake' ? (
            <>
              <p>Yashirin kod <strong className="challenge-code">{puzzle.secret}</strong></p>
              <div className="challenge-options">
                {round.clues.map((row) => (
                  <button key={row.guess} className="btn" aria-pressed={answer === row.guess} disabled={correct} onClick={() => choose(row.guess)}>
                    <strong className="challenge-code">{row.guess}</strong> <span>{describe(row)}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <ul className="challenge-clues">
                {puzzle.evidence.slice(0, round.id === 'best' ? 1 : 2).map((row) => (
                  <li key={row.guess}><strong className="challenge-code">{row.guess}</strong> <span>{describe(row)}</span></li>
                ))}
              </ul>
              <div className="challenge-options options-codes">
                {round.options.map((code) => (
                  <button key={code} className="btn challenge-code" aria-pressed={answer === code} disabled={correct} onClick={() => choose(code)}>{code}</button>
                ))}
              </div>
            </>
          )}
          <div className="challenge-feedback" role="status">
            {answer && !correct && (round.id === 'best'
              ? `Bu taxmin eng yomon holatda ${puzzle.tradeoffs[answer]} ta variant qoldiradi. Boshqa taxminni tanlang.`
              : 'Bu javob mos kelmadi. Dalillarni yana solishtiring.')}
            {correct && (round.id === 'evidence'
              ? 'To‘g‘ri! Shu kod ikkala taxmin natijasiga ham mos.'
              : round.id === 'best'
                ? `To‘g‘ri! Eng yomon holatda ${puzzle.tradeoffs[answer]} ta variant qoladi. ${round.options.filter((code) => code !== answer).map((code) => `${code} — ${puzzle.tradeoffs[code]} ta`).join(', ')}.`
                : `To‘g‘ri! ${answer} uchun haqiqiy javob: ${describe(round.actual)}.`)}
          </div>
          {correct && <button className="btn primary" onClick={next}>{step === 2 ? 'Yakunlash' : 'Keyingi vazifa →'}</button>}
        </>
      )}
    </div>
  );
}
