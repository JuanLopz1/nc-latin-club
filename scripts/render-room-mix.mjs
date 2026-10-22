// Render the club's existing original synth composition to a portable PCM loop.
// No recordings, samples, external services, or third-party music are used.
import { mkdirSync, writeFileSync } from 'node:fs';
const rate = 32000;
const beat = 60 / 92;
const chords = [
  [57, 60, 64],
  [53, 57, 60],
  [48, 52, 55],
  [55, 59, 62],
];
const count = Math.round(((64 * beat) / 2) * rate);
const samples = new Float64Array(count);
function note(midi, start, length, level, type) {
  const frequency = 440 * 2 ** ((midi - 69) / 12);
  const duration = Math.ceil(length * rate);
  for (let i = 0; i < duration; i++) {
    const time = i / rate;
    const phase = frequency * time;
    const wave =
      type === 'triangle'
        ? (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * phase))
        : Math.sin(2 * Math.PI * phase);
    const envelope =
      time < 0.035
        ? (level * time) / 0.035
        : level * Math.pow(0.0001 / level, (time - 0.035) / (length - 0.035));
    samples[(Math.round(start * rate) + i) % count] += wave * envelope;
  }
}
for (let step = 0; step < 64; step++) {
  const chord = chords[Math.floor(step / 16)];
  const when = (step * beat) / 2;
  note(chord[(step % 8) % 3] + 12, when, beat * 0.7, 0.05, 'triangle');
  if (step % 4 === 0) {
    note(chord[0] - 12, when, beat * 1.5, 0.09, 'sine');
    note(24, when, 0.14, 0.07, 'sine');
  }
  if (step % 16 === 0)
    for (const midi of chord) note(midi, when, beat * 7, 0.025, 'sine');
}
const mean = samples.reduce((sum, value) => sum + value, 0) / count;
// Gentle saturation lifts quiet passages while retaining headroom at full volume.
let low = 0;
let high = 100;
for (let pass = 0; pass < 30; pass++) {
  const gain = (low + high) / 2;
  const rms = Math.sqrt(
    samples.reduce(
      (sum, value) => sum + (0.9 * Math.tanh((value - mean) * gain)) ** 2,
      0,
    ) / count,
  );
  if (rms < 0.24) low = gain;
  else high = gain;
}
const wav = Buffer.alloc(44 + count * 2);
wav.write('RIFF');
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24);
wav.writeUInt32LE(rate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(count * 2, 40);
for (let i = 0; i < count; i++)
  wav.writeInt16LE(
    Math.round(0.9 * Math.tanh((samples[i] - mean) * high) * 32767),
    44 + i * 2,
  );
mkdirSync('public/audio', { recursive: true });
writeFileSync('public/audio/familia-mix.wav', wav);
console.log(
  `Rendered original room mix: ${(count / rate).toFixed(2)} seconds, ${wav.length} bytes, RMS 0.24 before volume.`,
);
