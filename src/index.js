import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore } from 'polotno/model/store';

const store = createStore();
window.store = store;

if (localStorage.getItem('polotno-state')) {
  const json = JSON.parse(localStorage.getItem('polotno-state'));
  store.loadJSON(json);
} else {
  store.addPage();
}

store.on('change', () => {
  const json = store.toJSON();
  delete json.history;
  delete localStorage.setItem('polotno-state', JSON.stringify(json));
});

ReactDOM.render(
  <React.StrictMode>
    <App store={store} />
  </React.StrictMode>,
  document.getElementById('root')
);

if (window.innerWidth < 650) {
  alert(
    'Hey, looks like you opened the app from the mobile. Polotno Studio is not optimized yet for mobile. But thanks for your interest! We will have mobile support soon. For now, please use it on the desktop.'
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
