import React from 'react';
import ReactDOM from 'react-dom';
import localforage from 'localforage';

import './index.css';
import App from './App';
import { createStore } from 'polotno/model/store';

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
