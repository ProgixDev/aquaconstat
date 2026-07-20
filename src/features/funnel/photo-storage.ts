import type { PhotoItem } from "./types";

/**
 * Photo persistence for the funnel (IndexedDB).
 *
 * Photos live in the store as `blob:` URLs, which die with the document — so
 * localStorage can't hold them. IndexedDB can store the Blob itself, and we
 * mint a fresh URL on rehydration.
 *
 * This matters most on phones: opening the camera app frequently evicts the
 * browser tab from memory, and étape 3 now demands 4 to 8 live shots. Without
 * this, a visitor coming back from their fifth photo finds an empty dossier.
 *
 * Every call degrades to a no-op instead of throwing: private browsing and
 * some lockdown settings deny IndexedDB, and a visitor who can't persist must
 * still be able to complete their dossier in one sitting.
 */

const DB_NAME = "olala-funnel";
const STORE = "photos";

export type StoredPhoto = Omit<PhotoItem, "url"> & {
  /** Null for entries rejected as too large — we keep the error card, not the file. */
  blob: Blob | null;
};

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, 1);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

/** Runs `work` inside a transaction, resolving `fallback` on any failure. */
async function withStore<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest,
  fallback: T,
): Promise<T> {
  const db = await openDb();
  if (!db) return fallback;
  return new Promise<T>((resolve) => {
    try {
      const tx = db.transaction(STORE, mode);
      const request = work(tx.objectStore(STORE));
      request.onsuccess = () => resolve((request.result as T) ?? fallback);
      request.onerror = () => resolve(fallback);
      tx.onabort = () => resolve(fallback);
    } catch {
      resolve(fallback);
    } finally {
      // The connection is cheap to reopen; holding it would block upgrades.
      setTimeout(() => db.close(), 0);
    }
  });
}

export async function savePhotos(records: StoredPhoto[]): Promise<void> {
  for (const record of records) {
    await withStore("readwrite", (store) => store.put(record), undefined);
  }
}

export async function loadPhotos(): Promise<StoredPhoto[]> {
  const all = await withStore<StoredPhoto[]>("readonly", (store) => store.getAll(), []);
  return [...all].sort((a, b) => a.id - b.id);
}

export async function deletePhoto(id: number): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id), undefined);
}

export async function clearPhotos(): Promise<void> {
  await withStore("readwrite", (store) => store.clear(), undefined);
}
