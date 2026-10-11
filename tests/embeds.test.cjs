/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const Spotify=require('../app/components/spotify-section.tsx').default;
const Instagram=require('../app/components/instagram-section.tsx').default;
test('Spotify renders the configured player without load or close actions, without autoplay',()=>{
 for(const language of ['en','es']) {const html=renderToStaticMarkup(React.createElement(Spotify,{language}));assert.match(html,/open.spotify.com\/embed\/album\/4kS7bSuU0Jm9LYMosFU2x5/);assert.doesNotMatch(html,/<button|autoplay/);assert.match(html,/href="https:\/\/open.spotify.com\/album\//);}
});
test('Instagram renders the official profile directly with a permanent external fallback',()=>{
 for(const language of ['en','es']) {const html=renderToStaticMarkup(React.createElement(Instagram,{language}));assert.match(html,/src="https:\/\/www.instagram.com\/nclat1nclub\/embed\/"/);assert.doesNotMatch(html,/<button/);assert.match(html,/href="https:\/\/www.instagram.com\/nclat1nclub\/"/);}
});
