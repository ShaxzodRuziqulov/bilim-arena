import astronaut from '../assets/race/astronaut.png';
import fox from '../assets/race/fox.png';
import lion from '../assets/race/lion.png';
import turtle from '../assets/race/turtle.png';

const portraits = new Map([
  ['🦊', fox],
  ['🧑‍🚀', astronaut],
  ['🐢', turtle],
  ['🦁', lion],
]);

export default function RaceHero({ hero }) {
  const portrait = portraits.get(hero);
  return portrait ? <img className="race-hero-art" src={portrait} alt="" draggable={false} /> : hero;
}
