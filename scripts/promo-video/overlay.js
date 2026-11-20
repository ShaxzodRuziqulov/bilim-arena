// Video ustidagi qatlam: yozuvlar (pastki chap), kirish va yakuniy ekranlar, telefon/doska sahnasi.
// Ilova sahifasiga yozish paytida kiritiladi; ilovaning o'z kodiga tegmaydi.
(() => {
  if (window.__ov) return;
  const css = `
  #ov-root { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; font-family: 'Nunito Variable', Nunito, system-ui, sans-serif; }
  .ov-cap { position: absolute; left: 56px; bottom: 56px; max-width: 1100px; padding: 22px 34px 24px 30px; border-radius: 26px;
    background: linear-gradient(135deg, #0b1630f2, #10264af2); border: 2px solid #ffffff22; box-shadow: 0 18px 50px #000a;
    color: #fff; transform: translateY(40px); opacity: 0; transition: transform .5s cubic-bezier(.2,1.2,.3,1), opacity .4s; }
  .ov-cap.on { transform: none; opacity: 1; }
  .ov-cap.right { left: auto; right: 56px; }
  .ov-cap::before { content: ''; position: absolute; left: 0; top: 18px; bottom: 18px; width: 7px; border-radius: 0 6px 6px 0; background: var(--c, #58edb0); }
  .ov-cap b { display: block; font-size: 46px; font-weight: 900; letter-spacing: -.01em; }
  .ov-cap span { display: block; margin-top: 6px; font-size: 28px; color: #c9dcf2; font-weight: 700; }
  .ov-card { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; text-align: center; color: #fff;
    background: radial-gradient(ellipse at 50% 30%, #1d3f6b 0, #0b1630 55%, #050a18 100%); opacity: 0; transition: opacity .6s; }
  .ov-card.on { opacity: 1; }
  .ov-card img { width: 220px; height: 220px; border-radius: 48px; box-shadow: 0 30px 80px #000c, 0 0 80px #ffd36b44; animation: ov-pop 1s cubic-bezier(.2,1.5,.4,1) both; }
  .ov-card h1 { margin: 0; font-size: 132px; font-weight: 900; letter-spacing: -.02em; line-height: 1;
    background: linear-gradient(180deg, #fff6d0, #ffd36b 55%, #f0a417); -webkit-background-clip: text; background-clip: text; color: transparent;
    animation: ov-rise .8s .25s both; }
  .ov-card h2 { margin: 0; font-size: 46px; font-weight: 800; color: #d8e8ff; animation: ov-rise .8s .5s both; }
  .ov-card .chips { display: flex; gap: 16px; animation: ov-rise .8s .8s both; }
  .ov-card .chips i { font-style: normal; font-size: 30px; font-weight: 800; padding: 12px 26px; border-radius: 99px; background: #ffffff14; border: 1px solid #ffffff2a; }
  .ov-dl { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; width: 1400px; animation: ov-rise .8s .3s both; }
  .ov-dl div { padding: 34px 36px; border-radius: 30px; background: #ffffff10; border: 2px solid #ffffff22; text-align: left; }
  .ov-dl b { display: block; font-size: 46px; }
  .ov-dl span { display: block; margin-top: 10px; font-size: 30px; color: #c9dcf2; font-weight: 700; }
  .ov-dl code { display: inline-block; margin-top: 16px; font: 800 30px Consolas, monospace; color: #ffd36b; }
  .ov-link { font: 800 34px Consolas, monospace; color: #8ff7cf; animation: ov-rise .8s .6s both; }
  .ov-devices { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 70px; padding-bottom: 120px;
    background: radial-gradient(ellipse at 50% 30%, #1d3f6b 0, #0b1630 60%, #050a18 100%); opacity: 0; transition: opacity .6s; }
  .ov-devices.on { opacity: 1; }
  .ov-board { width: 1040px; height: 585px; border-radius: 26px; overflow: hidden; border: 14px solid #1b2742; box-shadow: 0 30px 80px #000c; position: relative; }
  .ov-board iframe { width: 1600px; height: 900px; border: 0; transform: scale(.633); transform-origin: 0 0; }
  .ov-phone { width: 330px; height: 714px; border-radius: 52px; overflow: hidden; border: 14px solid #11182b; box-shadow: 0 30px 80px #000c, inset 0 0 0 2px #2b3a5c; position: relative; }
  .ov-phone iframe { width: 390px; height: 844px; border: 0; transform: scale(.774); transform-origin: 0 0; }
  .ov-devices small { position: absolute; bottom: -54px; left: 0; right: 0; text-align: center; color: #c9dcf2; font-size: 28px; font-weight: 800; }
  @keyframes ov-pop { from { transform: scale(.3) rotate(-12deg); opacity: 0; } }
  @keyframes ov-rise { from { transform: translateY(40px); opacity: 0; } }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  const root = document.createElement('div');
  root.id = 'ov-root';
  document.body.appendChild(root);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let cap = null;

  window.__ov = {
    wait,
    async caption(title, sub, color, pos) {
      await this.uncaption();
      cap = document.createElement('div');
      cap.className = 'ov-cap' + (pos === 'right' ? ' right' : '');
      if (color) cap.style.setProperty('--c', color);
      cap.innerHTML = `<b></b>${sub ? '<span></span>' : ''}`;
      cap.querySelector('b').textContent = title;
      if (sub) cap.querySelector('span').textContent = sub;
      root.appendChild(cap);
      await wait(30);
      cap.classList.add('on');
    },
    async uncaption() {
      if (!cap) return;
      const c = cap;
      cap = null;
      c.classList.remove('on');
      await wait(350);
      c.remove();
    },
    async card(html, cls = 'ov-card') {
      const el = document.createElement('div');
      el.className = cls;
      el.innerHTML = html;
      root.appendChild(el);
      await wait(30);
      el.classList.add('on');
      await wait(650);
      return el;
    },
    async close(el) {
      el.classList.remove('on');
      await wait(650);
      el.remove();
    },
  };
})();
