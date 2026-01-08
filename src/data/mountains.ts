import { Mountain } from '@/types';

export const mountains: Mountain[] = [
  { id: 'loon', name: 'Loon Mountain', state: 'NH', passes: ['ikon'], region: 'icecoast' },
  { id: 'sunday-river', name: 'Sunday River', state: 'ME', passes: ['ikon'], region: 'icecoast' },
  { id: 'sugarloaf', name: 'Sugarloaf', state: 'ME', passes: ['ikon'], region: 'icecoast' },
  { id: 'killington', name: 'Killington', state: 'VT', passes: ['ikon'], region: 'icecoast' },
  { id: 'sugarbush', name: 'Sugarbush', state: 'VT', passes: ['ikon'], region: 'icecoast' },
  { id: 'stratton', name: 'Stratton', state: 'VT', passes: ['ikon'], region: 'icecoast' },
  { id: 'mount-snow', name: 'Mount Snow', state: 'VT', passes: ['epic'], region: 'icecoast' },
  { id: 'okemo', name: 'Okemo', state: 'VT', passes: ['epic'], region: 'icecoast' },
  { id: 'stowe', name: 'Stowe', state: 'VT', passes: ['epic'], region: 'icecoast' },
  { id: 'jay-peak', name: 'Jay Peak', state: 'VT', passes: ['indy'], region: 'icecoast' },
  { id: 'cannon', name: 'Cannon Mountain', state: 'NH', passes: ['indy'], region: 'icecoast' },
  { id: 'bretton-woods', name: 'Bretton Woods', state: 'NH', passes: ['ikon'], region: 'icecoast' },
  { id: 'waterville', name: 'Waterville Valley', state: 'NH', passes: ['ikon'], region: 'icecoast' },
  { id: 'wachusett', name: 'Wachusett', state: 'MA', passes: ['epic'], region: 'icecoast' },
];

export function getMountainById(id: string): Mountain | undefined {
  return mountains.find((m) => m.id === id);
}

export function getMountainsByPass(pass: string): Mountain[] {
  return mountains.filter((m) => m.passes.includes(pass as Mountain['passes'][number]));
}
