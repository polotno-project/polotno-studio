import { nanoid } from 'nanoid';
import { storage } from './storage';

// WordPress REST API base URL - can be configured via environment variable
const WP_API_BASE = import.meta.env.VITE_WP_API_URL || '/wp-json/polotno-studio/v1';

// Helper to get WordPress nonce for authenticated requests
const getWPNonce = () => {
  return window.polotnoStudio?.nonce || '';
};

// Helper to get current user info from WordPress
const getCurrentUser = () => {
  return window.polotnoStudio?.currentUser || null;
};

// Check if user is logged in to WordPress
const isSignedIn = () => {
  return !!getCurrentUser();
};

// Helper to make authenticated API requests to WordPress
const apiRequest = async (endpoint, options = {}) => {
  const url = `${WP_API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-WP-Nonce': getWPNonce(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

// File operations - now using WordPress REST API
const writeFile = async function writeFile(fileName, data) {
  if (isSignedIn()) {
    // Upload to WordPress media library or custom storage
    const formData = new FormData();
    if (data instanceof Blob) {
      formData.append('file', data, fileName);
    } else {
      formData.append('file', new Blob([data]), fileName);
    }
    formData.append('path', fileName);

    return await apiRequest('/files', {
      method: 'POST',
      body: formData,
      headers: {
        'X-WP-Nonce': getWPNonce(),
      },
    });
  } else {
    await storage.setItem(fileName, data);
  }
};

const readFile = async function readFile(fileName) {
  if (isSignedIn()) {
    const response = await apiRequest(`/files?path=${encodeURIComponent(fileName)}`);
    return response.data;
  }
  return await storage.getItem(fileName);
};

const deleteFile = async function deleteFile(fileName) {
  if (isSignedIn()) {
    return await apiRequest(`/files?path=${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
    });
  }
  return await storage.removeItem(fileName);
};

// Key-value storage operations
const readKv = async function readKv(key) {
  if (isSignedIn()) {
    const response = await apiRequest(`/kv/${encodeURIComponent(key)}`);
    return response.data;
  } else {
    return await storage.getItem(key);
  }
};

const writeKv = async function writeKv(key, value) {
  if (isSignedIn()) {
    return await apiRequest(`/kv/${encodeURIComponent(key)}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  } else {
    return await storage.setItem(key, value);
  }
};

// Design management functions
export async function listDesigns() {
  return (await readKv('designs-list')) || [];
}

export async function deleteDesign({ id }) {
  const list = await listDesigns();
  const newList = list.filter((design) => design.id !== id);
  await writeKv('designs-list', newList);
  await deleteFile(`designs/${id}.json`);
  await deleteFile(`designs/${id}.jpg`);
}

export async function loadById({ id }) {
  let storeJSON = await readFile(`designs/${id}.json`);
  const list = await listDesigns();
  const design = list.find((design) => design.id === id);

  // if it is blob, convert to JSON
  if (storeJSON instanceof Blob) {
    storeJSON = JSON.parse(await storeJSON.text());
  } else if (typeof storeJSON === 'string') {
    storeJSON = JSON.parse(storeJSON);
  }

  return { storeJSON, name: design?.name };
}

export async function saveDesign({ storeJSON, preview, name, id }) {
  console.log('saving');
  if (!id) {
    id = nanoid(10);
  }

  const previewPath = `designs/${id}.jpg`;
  const storePath = `designs/${id}.json`;

  await writeFile(previewPath, preview);
  console.log('preview saved');
  await writeFile(storePath, JSON.stringify(storeJSON));

  let list = await listDesigns();
  const existing = list.find((design) => design.id === id);
  if (existing) {
    existing.name = name;
  } else {
    list.push({ id, name });
  }

  await writeKv('designs-list', list);
  return { id, status: 'saved' };
}

export const getPreview = async ({ id }) => {
  const preview = await readFile(`designs/${id}.jpg`);
  return URL.createObjectURL(preview);
};

// Asset management functions
export const listAssets = async () => {
  const list = (await readKv('assets-list')) || [];
  for (const asset of list) {
    asset.src = await getAssetSrc({ id: asset.id });
    asset.preview = await getAssetPreviewSrc({ id: asset.id });
  }
  return list;
};

export const getAssetSrc = async ({ id }) => {
  if (isSignedIn()) {
    // Get asset URL from WordPress
    const response = await apiRequest(`/assets/${encodeURIComponent(id)}`);
    return response.url;
  } else {
    const file = await readFile(`uploads/${id}`);
    return URL.createObjectURL(file);
  }
};

export const getAssetPreviewSrc = async ({ id }) => {
  if (isSignedIn()) {
    const response = await apiRequest(`/assets/${encodeURIComponent(id)}/preview`);
    return response.url;
  } else {
    const file = await readFile(`uploads/${id}-preview`);
    return URL.createObjectURL(file);
  }
};

export const uploadAsset = async ({ file, preview, type }) => {
  const list = await listAssets();
  const id = nanoid(10);
  await writeFile(`uploads/${id}`, file);
  await writeFile(`uploads/${id}-preview`, preview);
  list.push({ id, type });
  await writeKv('assets-list', list);

  const src = await getAssetSrc({ id });
  const previewSrc = await getAssetPreviewSrc({ id });
  return { id, src, preview: previewSrc };
};

export const deleteAsset = async ({ id }) => {
  const list = await listAssets();
  const newList = list.filter((asset) => asset.id !== id);
  await writeKv('assets-list', newList);
};

export { isSignedIn, getCurrentUser };
