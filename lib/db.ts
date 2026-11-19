const DB_NAME = "soro-admin-db";
const DB_VERSION = 2;

export const STORES = {
  RESERVAS: "reservas",
  SERVICIOS: "servicios",
  COMBOS: "combos",
  HORARIOS: "horarios",
  COLA_MUTACIONES: "cola_mutaciones",
  ULTIMO_SYNC: "ultimo_sync",
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORES.RESERVAS))
          db.createObjectStore(STORES.RESERVAS, { keyPath: "id" });
        if (!db.objectStoreNames.contains(STORES.SERVICIOS))
          db.createObjectStore(STORES.SERVICIOS, { keyPath: "id" });
        if (!db.objectStoreNames.contains(STORES.COMBOS))
          db.createObjectStore(STORES.COMBOS, { keyPath: "id" });
        if (!db.objectStoreNames.contains(STORES.HORARIOS))
          db.createObjectStore(STORES.HORARIOS, { keyPath: "id" });
        if (!db.objectStoreNames.contains(STORES.COLA_MUTACIONES)) {
          db.createObjectStore(STORES.COLA_MUTACIONES, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
        // ✅ AGREGÁ ESTAS 2 LÍNEAS:
        if (!db.objectStoreNames.contains(STORES.ULTIMO_SYNC)) {
          db.createObjectStore(STORES.ULTIMO_SYNC, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function dbGetAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbPut<T>(storeName: StoreName, item: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    // IndexedDB requiere 'any' en su definición de tipos nativa.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = store.put(item as any);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbPutAll<T>(
  storeName: StoreName,
  items: T[],
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();
    items.forEach((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store.put(item as any);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbDelete(
  storeName: StoreName,
  key: string | number,
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbClear(storeName: StoreName): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

export type Mutacion = {
  id?: number;
  tipo: "confirmar" | "cancelar" | "crear";
  reservaId: string;
  timestamp: string;
  intentos?: number;
};

export async function agregarMutacion(
  mutacion: Omit<Mutacion, "id" | "timestamp">,
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COLA_MUTACIONES, "readwrite");
    const store = tx.objectStore(STORES.COLA_MUTACIONES);
    const request = store.add({
      ...mutacion,
      timestamp: new Date().toISOString(),
    });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

export async function obtenerMutacionesPendientes(): Promise<Mutacion[]> {
  return dbGetAll<Mutacion>(STORES.COLA_MUTACIONES);
}

export async function eliminarMutacion(id: number): Promise<void> {
  await dbDelete(STORES.COLA_MUTACIONES, id);
}

export async function setUltimoSync(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ULTIMO_SYNC, "readwrite");
    const store = tx.objectStore(STORES.ULTIMO_SYNC);
    store.clear();
    store.put({ id: "last", timestamp: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getUltimoSync(): Promise<string | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ULTIMO_SYNC, "readonly");
    const store = tx.objectStore(STORES.ULTIMO_SYNC);
    const request = store.get("last");
    request.onsuccess = () => resolve(request.result?.timestamp ?? null);
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}
