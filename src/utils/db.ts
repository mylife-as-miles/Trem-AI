
// Simple wrapper around IndexedDB to mimic basic Dexie functionality
// implementation since we cannot install the actual library due to environment issues.

export interface RepoData {
    id?: number;
    name: string;
    brief: string;
    assets: any[];
    fileSystem: any[];
    created: number;
}

export interface AssetData {
    id: string;
    name: string;
    type: 'video' | 'image' | 'audio';
    blob?: Blob;
    url?: string; // For mock or external
    duration?: string;
    size?: number;
    created: number;
    thumb?: string;
    tags?: string[];
    meta?: any;
    status?: 'pending' | 'uploading' | 'processing' | 'ready' | 'error';
    progress?: number;
}

class TremDatabase {
    private dbName = 'TremDB';
    private version = 2;
    private db: IDBDatabase | null = null;

    constructor() {
        this.init();
    }

    private init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                console.error("IndexedDB error:", (event.target as any).error);
                reject((event.target as any).error);
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('repos')) {
                    db.createObjectStore('repos', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('assets')) {
                    db.createObjectStore('assets', { keyPath: 'id' });
                }
            };
        });
    }

    private async ensureDb(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.init();
        }
        return this.db!;
    }

    async addRepo(repo: Omit<RepoData, 'id'>): Promise<number> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['repos'], 'readwrite');
            const store = transaction.objectStore('repos');
            const request = store.add(repo);

            request.onsuccess = () => {
                resolve(request.result as number);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getAllRepos(): Promise<RepoData[]> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['repos'], 'readonly');
            const store = transaction.objectStore('repos');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result as RepoData[]);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getRepo(id: number): Promise<RepoData | undefined> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['repos'], 'readonly');
            const store = transaction.objectStore('repos');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result as RepoData);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async updateRepo(id: number, updates: Partial<RepoData>): Promise<void> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['repos'], 'readwrite');
            const store = transaction.objectStore('repos');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const repo = getRequest.result;
                if (repo) {
                    const updatedRepo = { ...repo, ...updates };
                    const putRequest = store.put(updatedRepo);

                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error('Repository not found'));
                }
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteRepo(id: number): Promise<void> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['repos'], 'readwrite');
            const store = transaction.objectStore('repos');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async addAsset(asset: AssetData): Promise<string> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['assets'], 'readwrite');
            const store = transaction.objectStore('assets');
            const request = store.put(asset); // use put to allow updates or inserts based on id

            request.onsuccess = () => {
                resolve(request.result as string);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getAllAssets(): Promise<AssetData[]> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction(['assets'], 'readonly');
                const store = transaction.objectStore('assets');
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result as AssetData[]);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            } catch (e) {
                // Store might not exist if update failed or old version loaded?
                // Should not happen with onupgradeneeded logic but safe to handle
                console.warn("Assets store access failed", e);
                resolve([]);
            }
        });
    }

    async getAsset(id: string): Promise<AssetData | undefined> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction(['assets'], 'readonly');
                const store = transaction.objectStore('assets');
                const request = store.get(id);

                request.onsuccess = () => {
                    resolve(request.result as AssetData);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            } catch (e) {
                console.warn("Assets store access failed", e);
                resolve(undefined);
            }
        });
    }

    async deleteAsset(id: string): Promise<void> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['assets'], 'readwrite');
            const store = transaction.objectStore('assets');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

export const db = new TremDatabase();
