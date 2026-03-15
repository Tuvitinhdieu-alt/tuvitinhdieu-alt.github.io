import { calculateHoroscope } from '../src/horoscopeCalculator.js';

const examples = [
  { birthDate: '2005-01-19', birthTime: '16:30', isLunar: true },
];

for (const ex of examples) {
  console.log('Input:', ex);
  try {
    const out = calculateHoroscope(ex);
    console.log('Output lunarInfo:\n', JSON.stringify(out.lunarInfo, null, 2));
  } catch (err) {
    console.error('Error calling calculateHoroscope:', err);
  }
}
