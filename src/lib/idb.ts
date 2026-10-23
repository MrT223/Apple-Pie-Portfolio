/**
 * IndexedDB Wrapper for Client-side Caching (Stale-While-Revalidate)
 * Follows DATABASE_API_ARCHITECTURE_GUIDE.md Section 6.1
 */

const IDB_NAME = "ApplePiePortfolioDB";
const IDB_VERSION = 1;
const STORE_NAME = "app_cache";

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        console.warn("[IndexedDB] Open failed:", req.error);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export async function idbGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function idbSet<T = unknown>(key: string, val: T): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(val, key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}
