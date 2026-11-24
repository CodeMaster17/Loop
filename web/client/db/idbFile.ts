// Saves and loads the SQLite database file in IndexedDB (the browser's on-device store).
const DB = 'rasoi';
const STORE = 'files';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadFile(name: string): Promise<Uint8Array | null> {
  const idb = await open();
  return new Promise((resolve, reject) => {
    const req = idb.transaction(STORE, 'readonly').objectStore(STORE).get(name);
    req.onsuccess = () => resolve(req.result ? new Uint8Array(req.result as ArrayBuffer) : null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFile(name: string, bytes: Uint8Array): Promise<void> {
  const idb = await open();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(bytes.slice().buffer, name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
