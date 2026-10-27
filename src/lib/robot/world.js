// Robot o'yinlari uchun umumiy maydon: katakli xarita, robot va batareyalar.
// Xarita satrlarda: "S" — start, "*" — batareya, "." — yo'l, "#" yoki bo'sh — chuqurlik.
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];

export function parseGrid(grid) {
  const rows = grid.length;
  const cols = Math.max(...grid.map((r) => r.length));
  const cells = [];
  const bats = [];
  let start = [0, 0];
  for (let y = 0; y < rows; y++) {
    cells[y] = [];
    for (let x = 0; x < cols; x++) {
      const ch = grid[y][x] || '#';
      cells[y][x] = ch !== '#';
      if (ch === 'S') start = [x, y];
      if (ch === '*') bats.push([x, y]);
    }
  }
  return { rows, cols, cells, bats, start };
}

export function createWorld(map, dir) {
  const w = {
    x: map.start[0],
    y: map.start[1],
    dir,
    rot: dir * 90,
    got: map.bats.map(() => false),
    left: map.bats.length,
    trail: [map.start.join(',')],
    floor(x, y) {
      return !!map.cells[y]?.[x];
    },
    // Bir katak oldinga. Yo'l bo'lmasa robot joyida qoladi va false qaytadi.
    step() {
      const nx = this.x + DX[this.dir];
      const ny = this.y + DY[this.dir];
      if (!this.floor(nx, ny)) return false;
      this.x = nx;
      this.y = ny;
      this.trail.push(`${nx},${ny}`);
      map.bats.forEach(([bx, by], i) => {
        if (!this.got[i] && bx === nx && by === ny) {
          this.got[i] = true;
          this.left--;
        }
      });
      return true;
    },
    turn(d) {
      this.dir = (this.dir + d + 4) % 4;
      this.rot += d * 90;
    },
    wallAhead() {
      return !this.floor(this.x + DX[this.dir], this.y + DY[this.dir]);
    },
    snapshot() {
      return { x: this.x, y: this.y, rot: this.rot, got: [...this.got], trail: [...new Set(this.trail)] };
    },
  };
  return w;
}

export const SPEEDS = { slow: 560, normal: 340, fast: 130 };

// Generator beradigan har bir amalni navbat bilan, kechikish bilan bajaradi.
// onAction(action) -> keyingi amalgacha kutish (ms) yoki false (to'xtash).
// stepMode yoqilgan bo'lsa, ko'rinadigan har bir amaldan keyin next() kutiladi.
export function startRun(gen, { onAction, onError, onDone, onWait, stepMode = false }) {
  let timer = null;
  let stopped = false;
  let waiting = false;
  let step = stepMode;

  const tick = () => {
    timer = null;
    if (stopped) return;
    let n;
    try {
      n = gen.next();
    } catch (error) {
      stopped = true;
      onError(error);
      return;
    }
    if (n.done) {
      stopped = true;
      onDone();
      return;
    }
    const delay = onAction(n.value);
    if (delay === false) {
      stopped = true;
      return;
    }
    if (step && n.value.visible) {
      waiting = true;
      onWait?.(true);
    } else timer = setTimeout(tick, delay);
  };
  timer = setTimeout(tick, 120);

  const resume = () => {
    if (!waiting || stopped) return;
    waiting = false;
    onWait?.(false);
    tick();
  };
  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
    },
    next: resume,
    setStepMode(value) {
      step = value;
      if (!value) resume();
    },
  };
}
