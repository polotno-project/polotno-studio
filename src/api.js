const API = 'http://localhost:3001/api';

export async function getProjectById({ id }) {
  const req = await fetch(`${API}/get-design?id=${id}`);
  if (!req.ok) {
    throw new Error('Project not found');
  }
  const json = await req.json();
  return {
    store: json.data.store,
    name: json.data.name,
  };
}

export async function saveProject({ store, preview, id, authToken, name }) {
  const req = await fetch(`${API}/save-design`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ store, preview, id, name }),
  });
  return await req.json();
}

export async function deleteDesign({ id, authToken }) {
  const req = await fetch(`${API}/delete-design`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
  return await req.json();
}
