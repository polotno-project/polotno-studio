import React from 'react';
import ReactDOM from 'react-dom';
import localforage from 'localforage';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore } from 'polotno/model/store';

import { setGoogleFonts } from 'polotno/config';

let GOOGLE_FONTS = [
  'Roboto',
  'Amatic SC',
  'Balsamiq Sans',
  'Caveat',
  'Jura',
  'Kelly Slab',
  'Marck Script',
  'Lobster',
  'Press Start 2P',
  'Ruslan Display',
  'Rubik Mono One',
  'Seymour One',
  'Underdog',
];

setGoogleFonts(GOOGLE_FONTS);

if (window.innerWidth < 650) {
  var mvp = document.getElementById('__viewport');
  mvp.setAttribute(
    'content',
    'width=device-width, height=device-height, initial-scale=0.5'
  );
  alert(
    'Hey, looks like you opened the app from the mobile. Polotno Studio is not optimized for mobile yet. But thanks for your interest! We will have mobile support soon. For now, please use it on the desktop.'
  );
}

const store = createStore({ key: 'nFA5H9elEytDyPyvKL7T' });
window.store = store;

localforage.getItem('polotno-state', function (err, json) {
  if (json) {
    store.loadJSON(json);
  }
  if (!store.pages.length) {
    store.addPage();
  }
});

store.on('change', () => {
  try {
    const json = store.toJSON();
    localforage.setItem('polotno-state', json);
  } catch (e) {}
});

ReactDOM.render(
  <React.StrictMode>
    <App store={store} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
