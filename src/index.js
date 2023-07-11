import React from 'react';
import ReactDOM from 'react-dom/client';

import { createStore } from 'polotno/model/store';
import { unstable_setAnimationsEnabled } from 'polotno/config';
import { Auth0Provider } from '@auth0/auth0-react';
import { createProject, ProjectContext } from './project';
import { SubscriptionProvider } from './subscription-context';

import './index.css';
import App from './App';
import './logger';

if (window.location.host !== 'studio.polotno.com') {
  console.log(
    `%cWelcome to Polotno Studio! Thanks for your interest in the project!
This repository has many customizations from the default version Polotno SDK.
I don't recommend to use it as starting point. 
Instead, you can start from any official demos, e.g.: https://polotno.com/docs/demo-full-editor 
or direct sandbox: https://codesandbox.io/s/github/polotno-project/polotno-site/tree/source/examples/polotno-demo?from-embed.
But feel free to use this repository as a reference for your own project and to learn how to use Polotno SDK.`,
    'background: rgba(54, 213, 67, 1); color: white; padding: 5px;'
  );
}

unstable_setAnimationsEnabled(true);

const store = createStore({ key: 'nFA5H9elEytDyPyvKL7T' });
window.store = store;
store.addPage();

const project = createProject({ store });
window.project = project;

const root = ReactDOM.createRoot(document.getElementById('root'));

const AUTH_DOMAIN = 'polotno-studio.eu.auth0.com';
const PRODUCTION_ID = process.env.REACT_APP_AUTH0_ID;
const LOCAL_ID = process.env.REACT_APP_AUTH0_ID;

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
