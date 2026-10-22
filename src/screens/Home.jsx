export default function Home({ onAdmin, onQuit }) {
  return (
    <div className="screen home">
      <div className="home-sky">
        <span className="cloud c1">☁️</span>
        <span className="cloud c2">☁️</span>
        <span className="cloud c3">☁️</span>
      </div>
      <div className="home-center">
        <img className="home-logo" src="./icon.svg" alt="" />
        <h1 className="home-title">Bilim Arena</h1>
        <p className="home-sub">Bilim bilan xazinaga yet!</p>
        <div className="home-heroes">🧑‍🚀 🥷 🧙 🤖 🦊</div>
        <p className="muted">O‘yinni o‘qituvchi boshlaydi</p>
      </div>
      <div className="home-actions">
        <button className="btn big" onClick={onAdmin}>
          🔒 O‘qituvchi paneli
        </button>
        {onQuit && (
          <button className="btn" onClick={onQuit}>
            ⏻ Chiqish
          </button>
        )}
      </div>
    </div>
  );
}
