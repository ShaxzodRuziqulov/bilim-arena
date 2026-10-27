const OPTIONS = [
  ['slow', '🐢', 'Sekin'],
  ['normal', '▶', 'O‘rtacha'],
  ['fast', '⚡', 'Tez'],
];

export default function SpeedPicker({ value, onChange }) {
  return (
    <div className="segmented robo-speed" title="Robot tezligi">
      {OPTIONS.map(([id, icon, label]) => (
        <button key={id} className={value === id ? 'active' : ''} onClick={() => onChange(id)} title={label}>
          {icon}
        </button>
      ))}
    </div>
  );
}
