export default function Home({ onAdmin, onQuit }) {
  return <div className="screen home classroom-home">
    <div className="home-sky"><span className="cloud c1">☁️</span><span className="cloud c2">☁️</span></div>
    <span className="classroom-label">BILIM ARENA · SINF EKRANI</span>
    <div className="home-center"><img className="home-logo" src="./icon.svg" alt="" /><h1 className="home-title">Bilim — eng katta xazina.</h1><p className="home-sub">Birga o‘ylang. Birga o‘rganing. Birga yuting.</p><div className="home-heroes">🦊 🧑‍🚀 🤖</div><p className="muted">Keyingi sarguzashtni o‘qituvchi boshlaydi.</p></div>
    <div className="home-actions"><button className="btn primary big" onClick={onAdmin}>O‘qituvchi studiyasini ochish ↗</button>{onQuit && <button className="btn" onClick={onQuit}>Chiqish</button>}</div>
  </div>;
}
