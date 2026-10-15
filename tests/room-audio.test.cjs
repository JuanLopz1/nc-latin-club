/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const RoomMusic=require('../app/components/gallery/room-music.tsx').default;

test('room mix has a native looping audio source, without autoplay',()=>{
 const html=renderToStaticMarkup(React.createElement(RoomMusic,{language:'en',spotifyUrl:'https://open.spotify.com/'}));
 assert.match(html,/<audio[^>]+src="\/audio\/familia-mix.wav"/);
 assert.match(html,/<audio[^>]+loop=""/);
 assert.doesNotMatch(html,/autoplay/i);
});

test('delivered room mix is audible at the default volume and has headroom',()=>{
 const wav=fs.readFileSync('public/audio/familia-mix.wav');
 assert.equal(wav.toString('ascii',0,4),'RIFF');
 assert.equal(wav.readUInt16LE(20),1);
 assert.equal(wav.readUInt16LE(34),16);
 const rate=wav.readUInt32LE(24),count=(wav.length-44)/2;
 assert.ok(count/rate>=20);
 let sum=0,peak=0;
 for(let i=44;i<wav.length;i+=2){const value=wav.readInt16LE(i)/32768;sum+=value*value;peak=Math.max(peak,Math.abs(value));}
 const rms=Math.sqrt(sum/count);
 assert.ok(rms*.4>=.08,`Default RMS ${rms*.4} is too quiet`);
 assert.ok(peak<=.93,`Peak ${peak} leaves insufficient headroom`);
 assert.ok(Math.abs(wav.readInt16LE(44)-wav.readInt16LE(wav.length-2))/32768<.05,'Loop boundary must not click');
});
