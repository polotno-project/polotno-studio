import localforage from 'localforage';

const API = 'https://polotno-studio-api.vercel.app/api';

export async function getDesignById({ id, authToken }) {
  // if (id === 'local') {
  if (true) {
    const json = await localforage.getItem('polotno-state');
    return {
      store: json,
      name: '',
    };
  }
  const req = await fetch(`${API}/designs/get?id=${id}`, {
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
  });
  if (!req.ok) {
    throw new Error('Design not found');
  }
  const json = await req.json();
  return {
    store: json.data.store,
    name: json.data.name,
  };
}

export async function listDesigns({ accessToken }) {
  const req = await fetch(API + '/designs/list', {
    method: 'GET',
    headers: {
      Authorization: accessToken,
    },
  });
  return req.json();
}

export async function getUserSubscription({ accessToken }) {
  const req = await fetch(API + '/user/subscription', {
    method: 'GET',
    headers: {
      Authorization: accessToken,
    },
  });
  return req.json();
}

export async function cancelUserSubscription({ accessToken, id }) {
  const req = await fetch(API + '/user/cancel-subscription', {
    method: 'POST',
    headers: {
      Authorization: accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
  return req.json();
}

export async function saveDesign({
  store,
  preview,
  id,
  authToken,
  name,
  isPrivate,
}) {
  // if (id === 'local' || !authToken) {
  localforage.setItem('polotno-state', store);
  return {
    id: 'local',
    status: 'saved',
  };
  // }
  const req = await fetch(`${API}/designs/save`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ store, preview, id, name, private: isPrivate }),
  });
  return await req.json();
}

export async function deleteDesign({ id, authToken }) {
  const req = await fetch(`${API}/designs/delete`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
  return await req.json();
}
