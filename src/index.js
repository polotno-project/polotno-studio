import React from 'react';
import ReactDOM from 'react-dom/client';
import localforage from 'localforage';
import { createStore } from 'polotno/model/store';
import { unstable_setRemoveBackgroundEnabled } from 'polotno/config';

import './index.css';
import App from './App';

unstable_setRemoveBackgroundEnabled(true);

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

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App store={store} />
  </React.StrictMode>
);
