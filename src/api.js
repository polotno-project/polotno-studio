import { nanoid } from 'nanoid';
import localforage from 'localforage';
import { dataURLtoBlob } from './blob';

const isSignedIn = () => {
  return window.puter?.auth?.isSignedIn();
};

async function writeFile(fileName, data) {
  if (isSignedIn()) {
    await window.puter.fs.write(fileName, data, { createMissingParents: true });
    // await new Promise((resolve) => setTimeout(resolve, 1000));
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

  await writeFile(`designs/${id}.jpg`, dataURLtoBlob(preview));
  await writeFile(`designs/${id}.json`, JSON.stringify(storeJSON));

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

const getPublicSubDomain = async () => {
  const user = await window.puter.auth.getUser();
  const subdomain = user.username + '-pltn';
  return subdomain;
};

const validatePublicAssets = async () => {
  const sites = await window.puter.hosting.list();
  const subdomain = await getPublicSubDomain();
  const publicSite = sites.find((site) => site.subdomain === subdomain);
  if (!publicSite) {
    await window.puter.hosting.create(subdomain, 'uploads');
  }
};

export const listAssets = async () => {
  const list = (await readKv('assets-list')) || [];
  for (const asset of list) {
    if (!asset.src) {
      asset.src = await getAssetSrc({ id: asset.id });
    }
  }
  return list;
};

export const getFileURL = async ({ uid }) => {
  const resp = await (
    await fetch('https://api.puter.com/auth/create-access-token', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.puter.authToken}`,
      },
      body: JSON.stringify({
        permissions: [`fs:${uid}:read`],
      }),
      method: 'POST',
    })
  ).json();
  const token = resp.token;
  const url = `https://api.puter.com/token-read?uid=${uid}&token=${token}`;
  return url;
};

export const getAssetSrc = async ({ id }) => {
  if (window.puter.auth.isSignedIn()) {
    await validatePublicAssets();
    const subdomain = await getPublicSubDomain();
    return `https://${subdomain}.puter.com/${id}`;
  } else {
    return await readFile(`uploads/${id}`);
  }
};

export const uploadAsset = async ({ file }) => {
  const list = await listAssets();
  const id = nanoid(10);
  await writeFile(`uploads/${id}`, file);
  list.push({ id });
  await writeKv('assets-list', list);

  // now make sure we have a public link
  await validatePublicAssets();
  const src = await getAssetSrc({ id });
  return { id, src };
};

export const deleteAsset = async ({ id }) => {
  const list = await listAssets();
  const newList = list.filter((asset) => asset.id !== id);
  console.log(id, newList);
  await writeKv('assets-list', newList);
};
