
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

class TremDatabase {
    private dbName = 'TremDB';
    private version = 1;
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
}

export const db = new TremDatabase();
