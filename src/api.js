import { nanoid } from 'nanoid';
import localforage from 'localforage';
import { dataURLtoBlob } from './blob';

const isSignedIn = () => {
  return window.puter?.auth?.isSignedIn();
};

async function writeFile(fileName, data) {
  if (isSignedIn()) {
    await window.puter.fs.write(fileName, data, { createMissingParents: true });
  } else {
    await localforage.setItem(fileName, data);
  }
}

async function readFile(fileName) {
  if (isSignedIn()) {
    return await window.puter.fs.read(fileName);
  }
  return await localforage.getItem(fileName);
}

async function deleteFile(fileName) {
  if (isSignedIn()) {
    return await window.puter.fs.delete(fileName);
  }
  return await localforage.removeItem(fileName);
}

async function readKv(key) {
  if (isSignedIn()) {
    return await window.puter.kv.get(key);
  } else {
    return await localforage.getItem(key);
  }
}

async function writeKv(key, value) {
  if (isSignedIn()) {
    return await window.puter.kv.set(key, value);
  } else {
    return await localforage.setItem(key, value);
  }
}

export async function backupFromLocalToCloud() {
  const localDesigns = (await localforage.getItem('designs-list')) || [];
  for (const design of localDesigns) {
    const storeJSON = await localforage.getItem(`designs/${design.id}.json`);
    const preview = await localforage.getItem(`designs/${design.id}.jpg`);
    await writeFile(`designs/${design.id}.json`, storeJSON);
    await writeFile(`designs/${design.id}.jpg`, preview);
  }
  const cloudDesigns = (await window.puter.kv.get('designs-list')) || [];
  cloudDesigns.push(...localDesigns);
  await window.puter.kv.set('designs-list', cloudDesigns);
  await localforage.removeItem('designs-list');
  for (const design of localDesigns) {
    await localforage.removeItem(`designs/${design.id}.json`);
    await localforage.removeItem(`designs/${design.id}.jpg`);
  }
  return cloudDesigns.length;
}

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
  if (!id) {
    id = nanoid(10);
  }

  const previewPath = `designs/${id}.jpg`;
  const storePath = `designs/${id}.json`;

  await writeFile(previewPath, preview);
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

const batchCall = (asyncFunction) => {
  let cachedPromise = null;
  return async (...args) => {
    if (!cachedPromise) {
      cachedPromise = asyncFunction(...args).catch((error) => {
        // Reset cachedPromise on error to allow retry
        cachedPromise = null;
        throw error;
      });
    }
    return cachedPromise;
  };
};

let subDomainCache = null;
const getPublicSubDomain = batchCall(async () => {
  if (subDomainCache) {
    return subDomainCache;
  }
  // fist we need to validate domain
  const sites = await window.puter.hosting.list();
  const user = await window.puter.auth.getUser();
  const prefix = user.username + '-pltn-pld';
  let subdomain = prefix;
  const existingDomain = sites.find(
    (site) => site.subdomain.indexOf(prefix) >= 0
  );

  if (existingDomain) {
    subDomainCache = existingDomain.subdomain;
    return existingDomain.subdomain;
  }
  let attempt = 1;
  while (attempt < 10) {
    const postfix = attempt > 1 ? `-${attempt}` : '';
    subdomain = `${prefix}${postfix}`;
    try {
      await window.puter.fs.mkdir('uploads', { createMissingParents: true });
      await window.puter.hosting.create(subdomain, 'uploads');
      break;
    } catch (error) {
      attempt++;
      continue;
    }
  }
  if (attempt >= 10) {
    throw new Error('Failed to create subdomain');
  }
  subDomainCache = subdomain;
  return subdomain;
});

export const listAssets = async () => {
  const list = (await readKv('assets-list')) || [];
  for (const asset of list) {
    asset.src = await getAssetSrc({ id: asset.id });
    asset.preview = await getAssetPreviewSrc({ id: asset.id });
  }
  return list;
};

export const getAssetSrc = async ({ id }) => {
  if (window.puter.auth.isSignedIn()) {
    const subdomain = await getPublicSubDomain();
    return `https://${subdomain}.puter.site/${id}`;
  } else {
    const file = await readFile(`uploads/${id}`);
    return URL.createObjectURL(file);
  }
};

export const getAssetPreviewSrc = async ({ id }) => {
  if (window.puter.auth.isSignedIn()) {
    const subdomain = await getPublicSubDomain();
    return `https://${subdomain}.puter.site/${id}-preview`;
  } else {
    const file = await readFile(`uploads/${id}-preview`);
    console.log('file', file);
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
