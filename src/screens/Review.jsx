import { useState } from 'react';
import { prepare, QuestionCard } from './Race.jsx';
export default function Review({ result, onBack }) {
  const questions=result.hard.filter(item=>item.question).map(item=>item.question);
  const [index,setIndex]=useState(0), [answer,setAnswer]=useState(null), [correct,setCorrect]=useState(0);
  const [item,setItem]=useState(()=>questions.length ? prepare(questions[0]) : null);
  const submit=(ok,extra={})=>{ if(answer)return; setAnswer({correct:ok,...extra}); if(ok)setCorrect(value=>value+1); };
  const next=()=>{ const n=index+1; setIndex(n); setAnswer(null); if(n<questions.length)setItem(prepare(questions[n])); };
  return <div className="race-wrap review-wrap"><div className="stage">
    <header className="review-heading"><span><b>Bilimni mustahkamlaymiz</b><small>Musobaqa natijasi o‘zgarmaydi · Vaqt cheklanmagan</small></span><span>{Math.min(index+1,questions.length)}/{questions.length}</span><button className="btn" onClick={onBack}>← Natijalarga</button></header>
    {index<questions.length && item ? <QuestionCard review key={index} item={item} team={{name:'Birga takrorlaymiz',color:'#6d9e77'}} time={0} paused={false} phase={answer?'feedback':'question'} result={answer} onAnswer={submit} onContinue={next}/> : <div className="review-summary"><span>✦</span><h1>Takrorlash yakunlandi!</h1><p>{questions.length} ta savoldan {correct} tasiga to‘g‘ri javob berdingiz.</p><p>Asosiy musobaqa natijasi o‘zgarmadi.</p><button className="btn primary big" onClick={onBack}>Natijalarga qaytish</button></div>}
  </div></div>;
}
