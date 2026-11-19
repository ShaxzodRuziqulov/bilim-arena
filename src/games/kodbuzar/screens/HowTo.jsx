import { Coach } from '../components/Mascot.jsx';

const Tile = ({ ch, m }) => <span className={`tile ${m ? `m-${m}` : 'filled'}`}>{ch}</span>;
const Peg = ({ m }) => <i className={`peg ${m}`} />;

export default function HowTo({ onBack }) {
  return (
    <div className="screen howto">
      <header className="bar">
        <button className="icon-btn" onClick={onBack} aria-label="Orqaga">←</button>
        <div className="bar-title"><b>Qanday o‘ynaladi</b><small>Bir daqiqada o‘rganing</small></div>
      </header>
      <Coach mood="happy" text="Men yashirin kod o‘ylayman, siz uni topasiz. Har taxmindan keyin men sizga yo‘l ko‘rsataman!" size={76} />
      <main className="howto-main">
        <section className="panel">
          <h2>1. Rangli seyflar 🟩🟨⬛</h2>
          <p>Birinchi dunyolarda har bir katak o‘z rangini oladi:</p>
          <div className="example">
            <span className="tiles"><Tile ch="3" m="bull" /><Tile ch="1" m="cow" /><Tile ch="4" m="miss" /></span>
          </div>
          <ul className="legend-list">
            <li><i className="sw bull" /> <b>yashil</b> — raqam kodda bor va o‘z joyida;</li>
            <li><i className="sw cow" /> <b>sariq</b> — raqam bor, lekin boshqa joyda;</li>
            <li><i className="sw miss" /> <b>kulrang</b> — bunday raqam kodda yo‘q.</li>
          </ul>
        </section>

        <section className="panel">
          <h2>2. Sirli seyflar 🟢🟡</h2>
          <p>Keyinroq ranglar yo‘qoladi — faqat nechta raqam <b>joyida</b> va nechtasi <b>bor, joyi boshqa</b> ekani aytiladi. Qaysi biri ekanini mantiq bilan topasiz.</p>
          <p>Yashirin kod: <span className="code">4 2 7 1</span></p>
          <div className="example">
            <span className="tiles"><Tile ch="1" /><Tile ch="2" /><Tile ch="3" /><Tile ch="4" /></span>
            <span className="pegs n4"><Peg m="bull" /><Peg m="cow" /><Peg m="cow" /><Peg m="miss" /></span>
          </div>
          <p><b>2</b> o‘z joyida (1 ta yashil). <b>1</b> va <b>4</b> bor, lekin boshqa joyda (2 ta sariq). <b>3</b> kodda yo‘q.</p>
        </section>

        <section className="panel">
          <h2>Yordamchilar</h2>
          <ul>
            <li><b>💡 Maslahat</b> — bitta raqamni to‘g‘ri joyiga qo‘yib beradi. Ishlatsangiz, eng ko‘pi 2 yulduz olasiz.</li>
            <li><b>🧠 Mantiq yordamchisi</b> — nechta variant qolganini ko‘rsatadi va zid taxminni ⚠ bilan belgilaydi.</li>
            <li><b>✎ Qayd</b> — raqamlarni “yo‘q” yoki “bor” deb belgilab borasiz.</li>
            <li>Klaviatura: raqamlar, <kbd>Enter</kbd> — tekshirish, <kbd>Backspace</kbd> — o‘chirish, <kbd>H</kbd> — maslahat, <kbd>Q</kbd> — qayd.</li>
          </ul>
        </section>

        <section className="panel">
          <h2>Yulduzlar va xarita ⭐</h2>
          <p>Seyfni qancha kam urinishda ochsangiz, shuncha ko‘p yulduz. 8 ta dunyo bor: 2 xonali koddan boshlanib, 5 xonali,
            takrorlanuvchi kodgacha asta-sekin qiyinlashadi.</p>
        </section>
        <button className="btn primary big" onClick={onBack}>Tushunarli!</button>
      </main>
    </div>
  );
}
