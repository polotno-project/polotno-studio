import React from 'react';
import ReactDOM from 'react-dom/client';
import localforage from 'localforage';
import { createStore } from 'polotno/model/store';
import { unstable_setRemoveBackgroundEnabled } from 'polotno/config';
import { Auth0Provider } from '@auth0/auth0-react';
import { createProject, ProjectContext } from './project';

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

const project = createProject({ store });
window.project = project;

const root = ReactDOM.createRoot(document.getElementById('root'));

const AUTH_DOMAIN = 'polotno-studio.eu.auth0.com';
const PRODUCTION_ID = 'tuToNnC2EHw5lnSCTaG5kbjUYqVaVbZx';
const LOCAL_ID = 'tuToNnC2EHw5lnSCTaG5kbjUYqVaVbZx';
const isLocalhost =
  typeof window !== undefined && window.location.href.indexOf('localhost') >= 0;
const ID = isLocalhost ? LOCAL_ID : PRODUCTION_ID;
const REDIRECT = isLocalhost
  ? 'http://localhost:3000'
  : 'https://studio.polotno.com';

root.render(
  <ProjectContext.Provider value={project}>
    <Auth0Provider domain={AUTH_DOMAIN} clientId={ID} redirectUri={REDIRECT}>
      <App store={store} />
    </Auth0Provider>
  </ProjectContext.Provider>
);
