const KEYWORDS = {
  python:
    'and as break class continue def elif else False for from if import in is lambda None not or pass print range return True while input int float str len list',
  pascal:
    'and array begin boolean char const div do downto else end for function if integer mod not of or procedure program real readln repeat string then to until var while writeln write',
  cpp: 'auto bool break case char const continue cout cin double else endl float for if include int long main namespace return std string using void while',
};

const SETS = Object.fromEntries(
  Object.entries(KEYWORDS).map(([lang, words]) => [lang, new Set(words.toLowerCase().split(' '))]),
);

// Izoh | satr | son | so'z
const TOKEN = /(#(?!include).*$|\/\/.*$|\{[^}]*\})|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?\b)|(#include|\b[A-Za-z_]\w*\b)/gm;

function highlight(code, lang) {
  const words = SETS[lang];
  const parts = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const [text, comment, string, number, word] = m;
    // Pascal'da {..} — izoh, Python'da esa lug'at; faqat Pascal uchun izoh deb olamiz.
    if (comment && comment.startsWith('{') && lang !== 'pascal') continue;
    if (comment && comment.startsWith('#') && lang !== 'python') continue;
    if (m.index > last) parts.push(code.slice(last, m.index));
    let cls = null;
    if (comment) cls = 'tk-comment';
    else if (string) cls = 'tk-string';
    else if (number) cls = 'tk-number';
    else if (word && words?.has(word.toLowerCase())) cls = 'tk-keyword';
    parts.push(cls ? <span key={m.index} className={cls}>{text}</span> : text);
    last = m.index + text.length;
  }
  parts.push(code.slice(last));
  return parts;
}

export default function CodeBlock({ code, lang }) {
  if (!code?.trim()) return null;
  return (
    <pre className="code-block">
      {lang && <span className="code-lang">{lang === 'cpp' ? 'C++' : lang}</span>}
      <code>{highlight(code, lang)}</code>
    </pre>
  );
}
