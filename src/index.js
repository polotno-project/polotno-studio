import React from 'react';
import ReactDOM from 'react-dom/client';

import { createStore } from 'polotno/model/store';
import { unstable_setRemoveBackgroundEnabled } from 'polotno/config';
import { Auth0Provider } from '@auth0/auth0-react';
import { createProject, ProjectContext } from './project';
import { SubscriptionProvider } from './subscription-context';

import './index.css';
import App from './App';

import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://e7d484f3277f4792a7c924a7004c20a8@o1067670.ingest.sentry.io/4504571570749440',

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

Sentry.addGlobalEventProcessor(function (event, hint) {
  if (window.store) {
    hint.attachments = [
      { filename: 'store.json', data: JSON.stringify(window.store.toJSON()) },
    ];
  }
  return event;
});

unstable_setRemoveBackgroundEnabled(true);

const store = createStore({ key: 'nFA5H9elEytDyPyvKL7T' });
window.store = store;
store.addPage();

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
      <SubscriptionProvider>
        <App store={store} />
      </SubscriptionProvider>
    </Auth0Provider>
  </ProjectContext.Provider>
);
